import { beforeEach, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
const mocks = vi.hoisted(() => ({ event: { create: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() }, paid: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { paymentEvent: mocks.event, order: { findUnique: vi.fn() } } }));
vi.mock("@/lib/commerce/razorpay", () => ({ verifyWebhookSignature: () => true }));
vi.mock("@/lib/commerce/orders", () => ({ markOrderPaidFromWebhook: mocks.paid, markOrderFailed: vi.fn(), markOrderRefunded: vi.fn() }));
import { POST } from "./route";
function request() { return new Request("https://example.com/api/webhooks/razorpay", { method: "POST", body: JSON.stringify({
  event: "payment.captured", payload: { payment: { entity: { id: "pay", order_id: "order", amount: 123, currency: "INR", status: "captured" } } },
}) }); }
beforeEach(() => {
  vi.resetAllMocks();
  mocks.event.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("duplicate", { code: "P2002", clientVersion: "7" }));
});
it("reclaims a crashed processing event and fences completion with the lease token", async () => {
  mocks.event.findUnique.mockResolvedValue({ id: "event", status: "PROCESSING", leaseUntil: new Date(0) });
  mocks.event.updateMany.mockResolvedValue({ count: 1 });
  expect((await POST(request())).status).toBe(200);
  expect(mocks.paid).toHaveBeenCalledOnce();
  const claim = mocks.event.updateMany.mock.calls[0][0];
  expect(claim.where.OR).toContainEqual({ status: "PROCESSING", leaseUntil: { lt: expect.any(Date) } });
  expect(mocks.event.updateMany.mock.calls[1][0].where.leaseToken).toBe(claim.data.leaseToken);
});
it("returns a retryable status while an active worker holds the lease", async () => {
  mocks.event.findUnique.mockResolvedValue({ id: "event", status: "PROCESSING" });
  mocks.event.updateMany.mockResolvedValue({ count: 0 });
  expect((await POST(request())).status).toBe(503);
  expect(mocks.paid).not.toHaveBeenCalled();
});
it("acknowledges a completed event without fulfilling twice", async () => {
  mocks.event.findUnique.mockResolvedValue({ id: "event", status: "PROCESSED" });
  expect((await POST(request())).status).toBe(200);
  expect(mocks.paid).not.toHaveBeenCalled();
});
