import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/** No Upstash account yet — redis stays null and every check below falls
 * back to the in-memory limiter, so this file is safe to ship before then. */
const redis = UPSTASH_URL && UPSTASH_TOKEN ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null;

// A Ratelimit instance is tied to one (limit, window) pair — cache one per
// pair rather than constructing a new client on every call.
const limiters = new Map<string, Ratelimit>();
function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: "successbrew-ratelimit",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * Best-effort in-memory fixed-window rate limiter — the original
 * implementation, kept as the fallback for local dev and for anyone running
 * this without an Upstash account. Each server instance keeps its own
 * counters, so on Vercel's multi-instance hosting this under-counts (a
 * visitor's requests can land on different instances); fine for low
 * traffic, not reliable at scale — that's exactly what the Upstash path
 * above fixes once configured.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
function checkRateLimitInMemory(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

/**
 * Rate limiter — backed by Upstash Redis (shared across every serverless
 * instance) once UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are set;
 * otherwise falls back to the in-memory counter above. Async because a real
 * distributed limiter is a network call — every caller already awaits this.
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!redis) return checkRateLimitInMemory(key, limit, windowMs);

  try {
    const { success } = await getLimiter(limit, windowMs).limit(key);
    return success;
  } catch (err) {
    // An Upstash outage shouldn't take down checkout/apply — fail open to
    // the in-memory fallback rather than blocking every request.
    console.error("Upstash rate limit check failed, falling back to in-memory limiter", err);
    return checkRateLimitInMemory(key, limit, windowMs);
  }
}

export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/** Same as clientIp(), but for Server Actions, which don't get a Request object
 * and read the incoming headers via next/headers instead. */
export async function clientIpFromHeaders(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
