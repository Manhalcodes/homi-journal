// api/journal-entries/index.js
// Method: GET
// Purpose: List recent entries for the current user (limit optional, default 20, max 100)
// Auth: requires Firebase ID token

export const config = { runtime: 'edge' };

import { getDb } from '../../api/_lib/db';
import { verifyIdToken } from '../../api/_lib/auth';
import { rateLimit, getClientIp } from '../../api/_lib/rateLimit';

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const decoded = await verifyIdToken(req);
  if (!decoded) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `list:${decoded.uid}:${ip}`, windowSeconds: 30, max: 60 });
  if (!rl.allowed) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 100);

  try {
    const db = await getDb();
    const cursor = db
      .collection('entries')
      .find({ userId: decoded.uid })
      .sort({ createdAt: -1 })
      .limit(limit);
    const docs = await cursor.toArray();
    const entries = docs.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }));
    return new Response(JSON.stringify({ entries }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}


