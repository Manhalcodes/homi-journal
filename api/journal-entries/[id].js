// api/journal-entries/[id].js
// Methods: PATCH (update entry text), DELETE (remove entry)
// Auth: requires Firebase ID token; only the owner can modify/delete

export const config = { runtime: 'edge' };

import { getDb } from '../../api/_lib/db';
import { verifyIdToken } from '../../api/_lib/auth';
import { rateLimit, getClientIp } from '../../api/_lib/rateLimit';

export default async function handler(req) {
  const decoded = await verifyIdToken(req);
  if (!decoded) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const ip = getClientIp(req);
  const action = req.method === 'DELETE' ? 'delete' : req.method === 'PATCH' ? 'edit' : 'other';
  const rl = await rateLimit({ key: `${action}:${decoded.uid}:${ip}`, windowSeconds: 60, max: 60 });
  if (!rl.allowed) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  try {
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    const _id = new ObjectId(id);

    if (req.method === 'PATCH') {
      const body = await req.json().catch(() => null);
      const text = (body?.entry ?? '').trim();
      if (!text) return new Response(JSON.stringify({ error: 'Missing entry' }), { status: 400 });
      const result = await db.collection('entries').updateOne(
        { _id, userId: decoded.uid },
        { $set: { entry: text, updatedAt: new Date() } },
      );
      if (result.matchedCount === 0) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (req.method === 'DELETE') {
      const result = await db.collection('entries').deleteOne({ _id, userId: decoded.uid });
      if (result.deletedCount === 0) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}


