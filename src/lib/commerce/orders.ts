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

/** Grants access after a verified `payment.captured` webhook. Single transaction:
 * Order -> PAID, Payment row, Entitlement upsert, ResourceAccess upsert, Lead -> PAID.
 * Brevo sync happens after commit, best-effort — a Brevo outage must never roll
 * back a paid order (PDF §9F). */
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

  // Idempotent: a payment.captured retry for an already-PAID order is a no-op.
  if (order.status === "PAID") return order;

  const product = getProductByKey(order.productKey);
  const resource = product
    ? await prisma.resource.findUnique({ where: { slug: product.resourceSlug } })
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt: new Date() },
    });

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
  });

  if (order.leadId) {
    await syncLeadToBrevo(order.leadId).catch(() => {});
  }

  return order;
}

/** payment.failed webhook — order stays retryable, lead is left as-is
 * (PDF §9A: "remain LEAD/Checkout state"). */
export async function markOrderFailed(params: { razorpayOrderId: string }) {
  const order = await prisma.order.findUnique({
    where: { provider_providerOrderId: { provider: "razorpay", providerOrderId: params.razorpayOrderId } },
  });
  if (!order) throw new Error(`Order not found for razorpayOrderId=${params.razorpayOrderId}`);
  if (order.status === "PAID") return order;

  return prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
}

/** refund.processed webhook — revokes the entitlement and any granted resource
 * access per the PDF's refund/revocation policy (§9E). */
export async function markOrderRefunded(params: { razorpayPaymentId: string }) {
  const payment = await prisma.payment.findUnique({
    where: { provider_providerPaymentId: { provider: "razorpay", providerPaymentId: params.razorpayPaymentId } },
    include: { order: true },
  });
  if (!payment) throw new Error(`Payment not found for razorpayPaymentId=${params.razorpayPaymentId}`);

  const order = payment.order;
  const product = getProductByKey(order.productKey);
  const resource = product
    ? await prisma.resource.findUnique({ where: { slug: product.resourceSlug } })
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
    await tx.order.update({ where: { id: order.id }, data: { status: "REFUNDED", refundedAt: new Date() } });

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
  });

  if (order.leadId) {
    await syncLeadToBrevo(order.leadId).catch(() => {});
  }

  return order;
}
