// api/_lib/rateLimit.js
// Purpose: Minimal rate limiting using Upstash Redis REST API.

function getClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

export function getClientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function rateLimit({ key, windowSeconds = 60, max = 60 }) {
  const client = getClient();
  if (!client) {
    // No limiter configured; allow by default
    return { allowed: true, remaining: max, reset: Date.now() + windowSeconds * 1000 };
  }

  try {
    // INCR key
    const incrRes = await fetch(`${client.url}/incr/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${client.token}` },
    });
    const incrJson = await incrRes.json();
    const count = Number(incrJson?.result ?? 0);

    if (count === 1) {
      // First hit in window; set expiry
      await fetch(`${client.url}/expire/${encodeURIComponent(key)}/${windowSeconds}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${client.token}` },
      });
    }

    const allowed = count <= max;
    const remaining = Math.max(0, max - count);

    // TTL for reset
    let resetMs = Date.now() + windowSeconds * 1000;
    try {
      const ttlRes = await fetch(`${client.url}/ttl/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${client.token}` },
      });
      const ttlJson = await ttlRes.json();
      const ttlSec = Number(ttlJson?.result ?? windowSeconds);
      if (ttlSec > 0) resetMs = Date.now() + ttlSec * 1000;
    } catch (_) {}

    return { allowed, remaining, reset: resetMs };
  } catch (_) {
    // On failure, fail-open
    return { allowed: true, remaining: max, reset: Date.now() + windowSeconds * 1000 };
  }
}


