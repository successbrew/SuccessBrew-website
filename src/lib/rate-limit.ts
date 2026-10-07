import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Vercel's Upstash marketplace integration injects KV_REST_API_* instead of
// the UPSTASH_* names, so accept either.
// Values pasted into a dashboard often pick up stray whitespace, newlines or
// surrounding quotes — strip those before use.
function envValue(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim().replace(/^["']|["']$/g, "").trim();
    if (value) return value;
  }
  return undefined;
}
const UPSTASH_URL = envValue("UPSTASH_REDIS_REST_URL", "KV_REST_API_URL");
const UPSTASH_TOKEN = envValue("UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN");

// Shared storage is mandatory in production. A malformed URL is logged and
// treated as missing (requests fail closed) instead of crashing at import
// time, which would otherwise break the whole build.
function createRedis(): Redis | null {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  if (!UPSTASH_URL.startsWith("https://")) {
    console.error(
      `SECURITY: Upstash REST URL must start with https:// (got "${UPSTASH_URL.slice(0, 12)}…"). ` +
        "Use the REST URL from the Upstash console, not the rediss:// connection string."
    );
    return null;
  }
  return new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
}
const redis = createRedis();

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

export type RateLimitResult = "ok" | "limited" | "unavailable";

/** Like checkRateLimit(), but distinguishes a genuine "too many requests" from
 * production refusing because shared storage is missing or failing — callers
 * that show the reason to users shouldn't blame their network for an outage. */
export async function checkRateLimitDetailed(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const inMemory = (): RateLimitResult => (checkRateLimitInMemory(key, limit, windowMs) ? "ok" : "limited");

  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.error("SECURITY: shared rate limit storage is missing");
      return "unavailable";
    }
    return inMemory();
  }

  try {
    const { success, reason } = await getLimiter(limit, windowMs).limit(key);
    if (reason === "timeout") return "unavailable";
    return success ? "ok" : "limited";
  } catch (err) {
    // Production fails closed (see SECURITY-ROLLOUT.md); only development
    // falls back to the in-memory limiter.
    console.error("Upstash rate limit check failed, falling back to in-memory limiter", err);
    return process.env.NODE_ENV === "production" ? "unavailable" : inMemory();
  }
}

/** Production requests are denied when shared storage is missing or unavailable. */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  return (await checkRateLimitDetailed(key, limit, windowMs)) === "ok";
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
