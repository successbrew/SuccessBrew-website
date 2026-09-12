import { prisma } from "@/lib/prisma";
import { getProductByKey } from "./product";
import { createRazorpayOrder } from "./razorpay";
import { upsertLead, syncLeadToBrevo } from "./leads";

/** Creates a local Order (INITIATED) + a remote Razorpay order, in that sequence,
 * so that by the time the client is allowed to open the checkout widget the Order
 * row already has providerOrderId set — the webhook can always find it. */
export async function createOrderForCheckout(params: {
  email: string;
  name?: string | null;
  userId?: string | null;
  productKey: string;
}) {
  const email = params.email.trim().toLowerCase();
  const product = getProductByKey(params.productKey);
  if (!product) throw new Error(`Unknown productKey: ${params.productKey}`);

  const lead = await upsertLead({
    email,
    name: params.name,
    userId: params.userId,
    source: "offer-checkout",
    status: "CHECKOUT_STARTED",
  });

  const order = await prisma.order.create({
    data: {
      leadId: lead.id,
      userId: params.userId ?? undefined,
      customerEmail: email,
      productKey: product.key,
      provider: "razorpay",
      amount: product.amount,
      currency: product.currency,
      status: "INITIATED",
    },
  });

  const razorpayOrder = await createRazorpayOrder({
    amount: product.amount,
    currency: product.currency,
    receipt: order.id,
    notes: { orderId: order.id, email },
  });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { providerOrderId: razorpayOrder.id, status: "PENDING" },
  });

  return {
    orderId: updated.id,
    razorpayOrderId: razorpayOrder.id,
    amount: product.amount,
    currency: product.currency,
  };
}

/** Order statuses a `payment.captured` webhook is allowed to move *from*.
 * REFUNDED/CANCELLED are deliberately excluded — a delayed or replayed
 * capture event must never reactivate a refunded/cancelled order. */
const PAYABLE_FROM_STATUSES = ["INITIATED", "PENDING", "FAILED"] as const;

/** Grants access after a verified `payment.captured` webhook. The order's
 * current status is re-checked with a conditional update *inside* the
 * transaction (not just read-then-write beforehand), so a concurrent refund
 * can't be clobbered back to PAID by a late/replayed capture event (H7).
 * Single transaction: Order -> PAID, Payment row, Entitlement upsert,
 * ResourceAccess upsert, Lead -> PAID. Brevo sync happens after commit,
 * best-effort — a Brevo outage must never roll back a paid order (PDF §9F). */
export async function markOrderPaidFromWebhook(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
}) {
  const order = await prisma.order.findUnique({
    where: { provider_providerOrderId: { provider: "razorpay", providerOrderId: params.razorpayOrderId } },
  });
  if (!order) {
    throw new Error(`Order not found for razorpayOrderId=${params.razorpayOrderId}`);
  }

  // Fast-path idempotency checks — the authoritative check is the conditional
  // update inside the transaction below.
  if (order.status === "PAID") return order;
  if (order.status === "REFUNDED" || order.status === "CANCELLED") {
    console.warn(
      `payment.captured for razorpayOrderId=${params.razorpayOrderId} ignored — order ${order.id} is already ${order.status}.`
    );
    return order;
  }

  const product = getProductByKey(order.productKey);
  const resource = product
    ? await prisma.resource.findUnique({ where: { slug: product.resourceSlug } })
    : null;

  const settled = await prisma.$transaction(async (tx) => {
    const claim = await tx.order.updateMany({
      where: { id: order.id, status: { in: PAYABLE_FROM_STATUSES } },
      data: { status: "PAID", paidAt: new Date() },
    });

    // Order moved to a terminal state (REFUNDED/CANCELLED) or was already PAID
    // between our read above and this transaction — do not grant/re-grant access.
    if (claim.count === 0) return false;

    await tx.payment.upsert({
      where: { provider_providerPaymentId: { provider: "razorpay", providerPaymentId: params.razorpayPaymentId } },
      create: {
        orderId: order.id,
        provider: "razorpay",
        providerPaymentId: params.razorpayPaymentId,
        amount: params.amount,
        currency: params.currency,
        status: "PAID",
        verifiedAt: new Date(),
      },
      update: { status: "PAID", verifiedAt: new Date() },
    });

    await tx.entitlement.upsert({
      where: { customerEmail_productKey: { customerEmail: order.customerEmail, productKey: order.productKey } },
      create: {
        userId: order.userId ?? undefined,
        customerEmail: order.customerEmail,
        productKey: order.productKey,
        status: "ACTIVE",
      },
      update: { status: "ACTIVE", revokedAt: null },
    });

    if (resource) {
      await tx.resourceAccess.upsert({
        where: { customerEmail_resourceId: { customerEmail: order.customerEmail, resourceId: resource.id } },
        create: {
          userId: order.userId ?? undefined,
          customerEmail: order.customerEmail,
          resourceId: resource.id,
        },
        update: { revokedAt: null },
      });
    }

    if (order.leadId) {
      await tx.lead.update({ where: { id: order.leadId }, data: { status: "PAID" } });
    }

    return true;
  });

  if (settled && order.leadId) {
    await syncLeadToBrevo(order.leadId).catch(() => {});
  }

  return order;
}

/** payment.failed webhook — order stays retryable, lead is left as-is
 * (PDF §9A: "remain LEAD/Checkout state"). Conditional update guards the same
 * race as markOrderPaidFromWebhook: a failure event must never downgrade an
 * order that's already PAID/REFUNDED/CANCELLED. */
export async function markOrderFailed(params: { razorpayOrderId: string }) {
  const order = await prisma.order.findUnique({
    where: { provider_providerOrderId: { provider: "razorpay", providerOrderId: params.razorpayOrderId } },
  });
  if (!order) throw new Error(`Order not found for razorpayOrderId=${params.razorpayOrderId}`);
  if (order.status !== "INITIATED" && order.status !== "PENDING") return order;

  await prisma.order.updateMany({
    where: { id: order.id, status: { in: ["INITIATED", "PENDING"] } },
    data: { status: "FAILED" },
  });
  return order;
}

/** refund.processed webhook — revokes the entitlement and any granted resource
 * access per the PDF's refund/revocation policy (§9E). Guarded so a retried
 * refund webhook (or one for a payment that was never captured) can't
 * re-apply revocation side effects or overwrite a differently-settled order. */
export async function markOrderRefunded(params: { razorpayPaymentId: string }) {
  const payment = await prisma.payment.findUnique({
    where: { provider_providerPaymentId: { provider: "razorpay", providerPaymentId: params.razorpayPaymentId } },
    include: { order: true },
  });
  if (!payment) throw new Error(`Payment not found for razorpayPaymentId=${params.razorpayPaymentId}`);

  // Idempotent no-op: already processed this refund.
  if (payment.status === "REFUNDED") return payment.order;

  const order = payment.order;
  const product = getProductByKey(order.productKey);
  const resource = product
    ? await prisma.resource.findUnique({ where: { slug: product.resourceSlug } })
    : null;

  const settled = await prisma.$transaction(async (tx) => {
    const claimedPayment = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "REFUNDED" } },
      data: { status: "REFUNDED" },
    });
    if (claimedPayment.count === 0) return false;

    // Only an order we actually marked PAID can be refunded — a refund event
    // for an order that's e.g. still PENDING or already CANCELLED indicates
    // a data mismatch worth surfacing rather than silently revoking access.
    const claimedOrder = await tx.order.updateMany({
      where: { id: order.id, status: "PAID" },
      data: { status: "REFUNDED", refundedAt: new Date() },
    });
    if (claimedOrder.count === 0) {
      console.warn(`refund.processed for payment ${payment.id} ignored — order ${order.id} was not PAID.`);
      return false;
    }

    await tx.entitlement.updateMany({
      where: { customerEmail: order.customerEmail, productKey: order.productKey },
      data: { status: "REVOKED", revokedAt: new Date() },
    });

    if (resource) {
      await tx.resourceAccess.updateMany({
        where: { customerEmail: order.customerEmail, resourceId: resource.id },
        data: { revokedAt: new Date() },
      });
    }

    if (order.leadId) {
      await tx.lead.update({ where: { id: order.leadId }, data: { status: "REFUNDED" } });
    }

    return true;
  });

  if (settled && order.leadId) {
    await syncLeadToBrevo(order.leadId).catch(() => {});
  }

  return order;
}
