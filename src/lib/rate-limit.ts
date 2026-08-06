import { headers } from "next/headers";

/**
 * Best-effort in-memory fixed-window rate limiter. Good enough for a single-region
 * small-team deployment; swap for Upstash/Redis if this ever runs multi-instance,
 * since each server instance keeps its own counters.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
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
