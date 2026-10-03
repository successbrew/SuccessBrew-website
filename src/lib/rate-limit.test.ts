import { afterEach, expect, it, vi } from "vitest";
vi.mock("next/headers", () => ({ headers: vi.fn() }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
it("fails closed in production without shared storage", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  const { checkRateLimit } = await import("./rate-limit");
  expect(await checkRateLimit("upload", 20, 60000)).toBe(false);
});
it("ignores spoofable forwarding headers unless the ingress is configured", async () => {
  vi.stubEnv("VERCEL", "");
  vi.stubEnv("TRUSTED_CLIENT_IP_HEADER", "");
  const { clientIp } = await import("./rate-limit");
  expect(clientIp(new Request("https://example.com", { headers: { "x-forwarded-for": "1.2.3.4" } }))).toBe("unknown");
});
it("uses the Vercel-controlled IP header", async () => {
  vi.stubEnv("VERCEL", "1");
  const { clientIp } = await import("./rate-limit");
  expect(clientIp(new Request("https://example.com", { headers: { "x-forwarded-for": "spoof", "x-vercel-forwarded-for": "1.2.3.4" } }))).toBe("1.2.3.4");
});
