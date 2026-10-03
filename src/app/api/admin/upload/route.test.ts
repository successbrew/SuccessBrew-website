import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ profile: vi.fn(), upload: vi.fn(), rate: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({ auth: { getSession: async () => ({ data: { user: { id: "admin", role: "admin" } } }) } }));
vi.mock("@/lib/prisma", () => ({ prisma: { adminProfile: { findUnique: mocks.profile } } }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.rate }));
vi.mock("@/lib/s3", () => ({ s3: { send: mocks.upload }, S3_BUCKET: "public", publicUrlForKey: vi.fn() }));
import { POST } from "./route";
beforeEach(() => vi.resetAllMocks());
it.each(["REVIEWER", "PODCAST_MANAGER"])("denies asset uploads for %s", async role => {
  mocks.profile.mockResolvedValue({ roles: [role] });
  const response = await POST(new Request("https://example.com/api/admin/upload", { method: "POST" }));
  expect(response.status).toBe(403);
  expect(mocks.upload).not.toHaveBeenCalled();
  expect(mocks.rate).not.toHaveBeenCalled();
});
