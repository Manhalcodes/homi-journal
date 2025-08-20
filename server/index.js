// Express server for Homi
// Purpose: Provide a secure backend proxy between the frontend and OpenRouter
// so that the client never sees the API key and requests can be validated.

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fetch from 'node-fetch';
import { z } from 'zod';
import admin from 'firebase-admin';
import { MongoClient, ObjectId } from 'mongodb';
import rateLimit from 'express-rate-limit';

dotenv.config();

// Validate required environment variables at startup for fast feedback
const requiredEnv = z.object({
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  PORT: z.string().optional(),
  // Optionally restrict origins via FRONTEND_ORIGIN to tighten CORS in production
  FRONTEND_ORIGIN: z.string().optional(),
  // Optional model override; defaults to a Mistral instruct model
  OPENROUTER_MODEL: z.string().optional(),
});

const env = requiredEnv.safeParse(process.env);
if (!env.success) {
  // eslint-disable-next-line no-console
  console.error('Environment validation error:', env.error.flatten().fieldErrors);
  process.exit(1);
}

const app = express();

// --- MongoDB setup ---
// Use a single, cached Mongo client across requests (important for serverless)
let cachedMongoClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'homi';
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  if (!cachedMongoClient) {
    cachedMongoClient = new MongoClient(uri, { ignoreUndefined: true });
    await cachedMongoClient.connect();
  }
  cachedDb = cachedMongoClient.db(dbName);
  return cachedDb;
}

// Configure CORS: allow local dev and optional explicit origin
const allowedOrigins = new Set([
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:5173',
  'http://localhost:3000', // CRA default
  'http://127.0.0.1:3000',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (no origin) and whitelisted origins
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
}));

// JSON body parsing
app.use(express.json({ limit: '1mb' }));

// Basic request logging
app.use(morgan('dev'));

// Basic rate limiting per IP (you can also key by userId after auth)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
// Optional Firebase Admin verification
// To enable: set GOOGLE_APPLICATION_CREDENTIALS or initialize via env variables.
try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey && privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      admin.initializeApp();
    }
  }
  // eslint-disable-next-line no-console
  console.log('Firebase Admin initialized');
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Firebase Admin not initialized; ID token verification disabled:', e?.message);
}

async function verifyAuthToken(req) {
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;
  if (!idToken || !admin.apps.length) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (_) {
    return null;
  }
}


// Input schema for journaling requests
const journalRequestSchema = z.object({
  entry: z.string().min(1, 'Journal entry cannot be empty').max(4000, 'Journal entry too long'),
  // Optional user hint to tune tone or style
  tone: z.string().optional(),
});

// Helper: Build a safe, empathetic system prompt
function buildSystemPrompt(tone) {
  const base = `You are Homi, a gentle journaling companion. Respond with warmth, validation, and reflective questions.
Avoid medical advice or diagnostics. Encourage self-care and next steps.
Keep responses concise (4-7 sentences), empathetic, and non-judgmental.`;
  if (!tone) return base;
  return `${base}\nPreferred tone: ${tone}.`;
}

// POST /api/ai-journal — forwards the journal entry to OpenRouter
app.post('/api/ai-journal', async (req, res) => {
  const decoded = await verifyAuthToken(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const parsed = journalRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const { entry, tone } = parsed.data;

  try {
    const model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct';

    // Prepare OpenRouter chat-completions request
    // Docs: https://openrouter.ai/docs
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        // Optional routing headers:
        // 'HTTP-Referer': process.env.PUBLIC_BASE_URL ?? '',
        // 'X-Title': 'Homi Journaling',
      },
      body: JSON.stringify({
        // Use a Mistral family model by default, customizable via env
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt(tone) },
          {
            role: 'user',
            content: `Journal entry:\n\n${entry}\n\nTask: 1) Provide an empathetic reflection. 2) Then propose 2-3 short reflective questions labeled as Q1:, Q2:, Q3:. Keep it safe and supportive.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!openRouterResponse.ok) {
      const errText = await openRouterResponse.text();
      return res.status(502).json({ error: 'Upstream AI error', details: errText });
    }

    const data = await openRouterResponse.json();
    const fullText = data?.choices?.[0]?.message?.content ?? '';

    // Extract questions of the form Q1:, Q2:, Q3: from the assistant text
    const questionMatches = fullText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^Q\d+\s*:\s*/i.test(line))
      .map((line) => line.replace(/^Q\d+\s*:\s*/i, ''))
      .filter(Boolean)
      .slice(0, 3);

    // Persist entry + AI result into MongoDB
    try {
      const db = await getDb();
      const entries = db.collection('entries');
      await entries.insertOne({
        userId: decoded.uid,
        entry,
        ai: { content: fullText, questions: questionMatches },
        createdAt: new Date(),
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Mongo insert failed:', e?.message);
    }

    return res.json({ content: fullText, questions: questionMatches });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: String(error) });
  }
});

// GET /api/journal-entries — list current user's recent entries
app.get('/api/journal-entries', async (req, res) => {
  const decoded = await verifyAuthToken(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  try {
    const db = await getDb();
    const entries = db.collection('entries');
    const docs = await entries
      .find({ userId: decoded.uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    const result = docs.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }));
    return res.json({ entries: result });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', details: String(e) });
  }
});

// PATCH /api/journal-entries/:id — edit an existing entry's text only
app.patch('/api/journal-entries/:id', async (req, res) => {
  const decoded = await verifyAuthToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const id = req.params.id;
  const text = (req.body?.entry ?? '').trim();
  if (!id || !text) return res.status(400).json({ error: 'Missing id or entry' });

  try {
    const db = await getDb();
    const entries = db.collection('entries');
    const result = await entries.updateOne(
      { _id: new ObjectId(id), userId: decoded.uid },
      { $set: { entry: text, updatedAt: new Date() } },
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', details: String(e) });
  }
});

// DELETE /api/journal-entries/:id — delete an entry
app.delete('/api/journal-entries/:id', async (req, res) => {
  const decoded = await verifyAuthToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const db = await getDb();
    const entries = db.collection('entries');
    const result = await entries.deleteOne({ _id: new ObjectId(id), userId: decoded.uid });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', details: String(e) });
  }
});

// Health check for monitoring
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'homi-server' });
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Homi server listening on http://localhost:${port}`);
});


