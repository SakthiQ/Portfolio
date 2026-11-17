// Simple in-memory token bucket per IP. On serverless each instance keeps its
// own buckets, which is fine as a first line of defence for a portfolio.
// For stricter limits, swap this for Upstash Redis.

type Bucket = { tokens: number; last: number };

const CAPACITY = 8; // burst size
const REFILL_MS = 7_500; // one request back every 7.5s (~8 per minute)
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: CAPACITY, last: now };
  const refill = Math.floor((now - b.last) / REFILL_MS);
  if (refill > 0) {
    b.tokens = Math.min(CAPACITY, b.tokens + refill);
    b.last += refill * REFILL_MS;
  }
  if (b.tokens <= 0) {
    buckets.set(key, b);
    return { ok: false, retryAfter: Math.ceil((REFILL_MS - (now - b.last)) / 1000) };
  }
  b.tokens -= 1;
  buckets.set(key, b);
  if (buckets.size > 5_000) {
    // Drop the oldest entries so memory stays bounded.
    for (const k of [...buckets.keys()].slice(0, 1_000)) buckets.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}
