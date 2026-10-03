import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Shared storage is mandatory in production.
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

// Local development fallback only.
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

/** Production requests are denied when shared storage is missing or unavailable. */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.error("SECURITY: shared rate limit storage is missing");
      return false;
    }
    return checkRateLimitInMemory(key, limit, windowMs);
  }

  try {
    const { success, reason } = await getLimiter(limit, windowMs).limit(key);
    return success && reason !== "timeout";
  } catch (err) {
    // An Upstash outage shouldn't take down checkout/apply — fail open to
    // the in-memory fallback rather than blocking every request.
    console.error("Upstash rate limit check failed, falling back to in-memory limiter", err);
    return process.env.NODE_ENV !== "production" && checkRateLimitInMemory(key, limit, windowMs);
  }
}

export function clientIp(request: Request): string {
  const forwardedFor = trustedIp(request.headers);
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/** Same as clientIp(), but for Server Actions, which don't get a Request object
 * and read the incoming headers via next/headers instead. */
export async function clientIpFromHeaders(): Promise<string> {
  const forwardedFor = trustedIp(await headers());
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

function trustedIp(value: Headers): string | null {
  // Vercel overwrites this header. Other deployments must configure an ingress
  // that strips and replaces the selected header; never trust arbitrary XFF.
  if (process.env.VERCEL === "1") return value.get("x-vercel-forwarded-for");
  const name = process.env.TRUSTED_CLIENT_IP_HEADER;
  return name ? value.get(name) : null;
}
