// In-process sliding-window limiter. The app runs as a single Node process on Windows Server
// behind IIS, so process memory is an appropriate store.
const buckets = new Map();

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { ok: true };
}

/**
 * Client IP as seen by the reverse proxy (IIS). The proxy appends the real peer address as the
 * LAST X-Forwarded-For entry; earlier entries come from the client and can be forged, so they are ignored.
 * The Node server must only listen on 127.0.0.1 so every request passes through the proxy.
 */
export function ipFromHeaders(headers) {
  const fwd = headers.get('x-forwarded-for');
  const last = fwd?.split(',').map((s) => s.trim()).filter(Boolean).pop();
  return (last || headers.get('x-real-ip') || 'unknown').slice(0, 64);
}

export function clientIp(request) {
  return ipFromHeaders(request.headers);
}
