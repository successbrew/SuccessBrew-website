import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ order: { findUnique: vi.fn(), updateMany: vi.fn(), findFirst: vi.fn() },
  payment: { findUnique: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
  refund: { findUnique: vi.fn(), create: vi.fn(), aggregate: vi.fn() },
  resource: { findUnique: vi.fn() }, entitlement: { upsert: vi.fn(), updateMany: vi.fn() },
  resourceAccess: { upsert: vi.fn(), updateMany: vi.fn() }, lead: { update: vi.fn() }, $transaction: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("./leads", () => ({ upsertLead: vi.fn(), syncLeadToBrevo: vi.fn() }));
import { markOrderPaidFromWebhook, markOrderRefunded } from "./orders";
const order = { id: "order", customerEmail: "buyer@example.com", productKey: "successbrew-community-2999", amount: 299900, currency: "INR", status: "PENDING" };
const capture = { razorpayOrderId: "order_remote", razorpayPaymentId: "pay_remote", amount: 299900, currency: "INR", paymentStatus: "captured" };
beforeEach(() => {
  vi.resetAllMocks();
  db.order.findUnique.mockResolvedValue(order);
  db.order.updateMany.mockResolvedValue({ count: 1 });
  db.payment.updateMany.mockResolvedValue({ count: 1 });
  db.resource.findUnique.mockResolvedValue({ id: "resource", slug: "community-course-access" });
  db.$transaction.mockImplementation(fn => fn(db));
});
describe("settlement validation", () => {
  it.each([{ amount: 1 }, { currency: "USD" }, { paymentStatus: "authorized" }, { amount: NaN }])("rejects mismatched capture %j without granting access", async mismatch => {
    await expect(markOrderPaidFromWebhook({ ...capture, ...mismatch })).rejects.toThrow("mismatch");
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it("rejects reuse of a payment belonging to another order", async () => {
    db.payment.findUnique.mockResolvedValue({ orderId: "another-order" });
    await expect(markOrderPaidFromWebhook(capture)).rejects.toThrow("another order");
  });
  it("grants access for a valid capture", async () => {
    await markOrderPaidFromWebhook(capture);
    expect(db.payment.create).toHaveBeenCalled();
    expect(db.entitlement.upsert).toHaveBeenCalled();
  });
  it("does not reactivate refunded orders", async () => {
    db.order.findUnique.mockResolvedValue({ ...order, status: "REFUNDED" });
    await markOrderPaidFromWebhook(capture);
    expect(db.entitlement.upsert).not.toHaveBeenCalled();
  });
});
describe("refund policy", () => {
  beforeEach(() => {
    db.payment.findUnique.mockResolvedValue({ id: "payment", amount: order.amount, order: { ...order, status: "PAID" } });
  });
  it("retains access on partial refunds", async () => {
    db.refund.aggregate.mockResolvedValue({ _sum: { amount: 1000 } });
    await markOrderRefunded({ razorpayPaymentId: "pay_remote", refundId: "refund", amount: 1000 });
    expect(db.entitlement.updateMany).not.toHaveBeenCalled();
    expect(db.order.updateMany).not.toHaveBeenCalled();
  });
  it("retains access when another paid purchase exists", async () => {
    db.refund.aggregate.mockResolvedValue({ _sum: { amount: order.amount } });
    db.order.findFirst.mockResolvedValue({ id: "another" });
    await markOrderRefunded({ razorpayPaymentId: "pay_remote", refundId: "refund", amount: order.amount });
    expect(db.entitlement.updateMany).not.toHaveBeenCalled();
  });
  it("revokes access on a full refund without another purchase", async () => {
    db.refund.aggregate.mockResolvedValue({ _sum: { amount: order.amount } });
    await markOrderRefunded({ razorpayPaymentId: "pay_remote", refundId: "refund", amount: order.amount });
    expect(db.entitlement.updateMany).toHaveBeenCalled();
  });
  it("does not count a repeated refund twice", async () => {
    db.refund.findUnique.mockResolvedValue({ paymentId: "payment", amount: 1000 });
    await markOrderRefunded({ razorpayPaymentId: "pay_remote", refundId: "refund", amount: 1000 });
    expect(db.refund.create).not.toHaveBeenCalled();
  });
});
