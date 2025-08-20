// api/ai-journal.js
// Method: POST
// Purpose: Create an empathetic AI reflection for a journal entry using OpenRouter (Mistral),
// store it in MongoDB, and return reflection text + up to 3 reflective questions.
// Auth: requires Firebase ID token in Authorization: Bearer <token>

export const config = { runtime: 'edge' };

import { z } from 'zod';

import { getDb } from './_lib/db';
import { verifyIdToken } from './_lib/auth';
import { rateLimit, getClientIp } from './_lib/rateLimit';

const journalRequestSchema = z.object({
  entry: z.string().min(1).max(4000),
  tone: z.string().optional(),
});

function buildSystemPrompt(tone) {
  const base = `You are Homi, a gentle journaling companion. Respond with warmth, validation, and reflective questions.
Avoid medical advice or diagnostics. Encourage self-care and next steps.
Keep responses concise (4-7 sentences), empathetic, and non-judgmental.`;
  return tone ? `${base}\nPreferred tone: ${tone}.` : base;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const decoded = await verifyIdToken(req);
  if (!decoded) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Rate limit by user + IP
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `ai:${decoded.uid}:${ip}`, windowSeconds: 60, max: 30 });
  if (!rl.allowed) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = journalRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  const { entry, tone } = parsed.data;
  try {
    const model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct';
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt(tone) },
          { role: 'user', content: `Journal entry:\n\n${entry}\n\nTask: 1) Provide an empathetic reflection. 2) Then propose 2-3 short reflective questions labeled as Q1:, Q2:, Q3:. Keep it safe and supportive.` },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });
    if (!upstream.ok) {
      const t = await upstream.text();
      return new Response(JSON.stringify({ error: 'Upstream AI error', details: t }), { status: 502 });
    }
    const data = await upstream.json();
    const fullText = data?.choices?.[0]?.message?.content ?? '';
    const questions = fullText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^Q\d+\s*:/i.test(l))
      .map((l) => l.replace(/^Q\d+\s*:\s*/i, ''))
      .filter(Boolean)
      .slice(0, 3);

    try {
      const db = await getDb();
      await db.collection('entries').insertOne({
        userId: decoded.uid,
        entry,
        ai: { content: fullText, questions },
        createdAt: new Date(),
      });
    } catch (e) {
      // ignore insert failures to not block response
    }

    return new Response(JSON.stringify({ content: fullText, questions }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}


