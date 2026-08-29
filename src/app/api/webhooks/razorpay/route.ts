import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/commerce/razorpay";
import { markOrderPaidFromWebhook, markOrderFailed, markOrderRefunded } from "@/lib/commerce/orders";

interface RazorpayEventPayload {
  event: string;
  created_at?: number;
  payload?: {
    payment?: {
      entity?: { id: string; order_id?: string; amount?: number; currency?: string };
    };
    refund?: {
      entity?: { id: string; payment_id?: string };
    };
    order?: {
      entity?: { id: string };
    };
  };
}

/**
 * Razorpay webhook receiver. Treated as the sole authority for payment
 * confirmation (PDF §8) — never trust the browser's post-checkout redirect.
 *
 * Body MUST be read as raw text before any JSON parsing: the HMAC signature is
 * computed over the exact bytes Razorpay sent, and re-serializing a parsed
 * object would produce a different (and wrongly-rejected) signature.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const body = parsed as RazorpayEventPayload;

  const paymentEntity = body.payload?.payment?.entity;
  const refundEntity = body.payload?.refund?.entity;
  const orderEntity = body.payload?.order?.entity;
  const razorpayOrderId = paymentEntity?.order_id ?? orderEntity?.id ?? null;

  // Prefer Razorpay's event-id header when present; otherwise derive a
  // deterministic key so retried deliveries of the same event still dedupe.
  const eventId =
    request.headers.get("x-razorpay-event-id") ??
    `${body.event}:${paymentEntity?.id ?? refundEntity?.id ?? orderEntity?.id ?? "unknown"}:${body.created_at ?? ""}`;

  const localOrder = razorpayOrderId
    ? await prisma.order.findUnique({
        where: { provider_providerOrderId: { provider: "razorpay", providerOrderId: razorpayOrderId } },
      })
    : null;

  let eventRow;
  try {
    eventRow = await prisma.paymentEvent.create({
      data: {
        provider: "razorpay",
        eventId,
        eventType: body.event,
        payload: parsed as Prisma.InputJsonValue,
        status: "PROCESSING",
        orderId: localOrder?.id,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Already processed this exact webhook delivery — idempotent no-op.
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("failed to record razorpay payment event", err);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }

  try {
    switch (body.event) {
      case "payment.captured": {
        if (!razorpayOrderId || !paymentEntity?.id) throw new Error("Missing order/payment id");
        await markOrderPaidFromWebhook({
          razorpayOrderId,
          razorpayPaymentId: paymentEntity.id,
          amount: paymentEntity.amount ?? 0,
          currency: paymentEntity.currency ?? "INR",
        });
        break;
      }
      case "payment.failed": {
        if (!razorpayOrderId) throw new Error("Missing order id");
        await markOrderFailed({ razorpayOrderId });
        break;
      }
      case "refund.processed": {
        const paymentId = refundEntity?.payment_id ?? paymentEntity?.id;
        if (!paymentId) throw new Error("Missing payment id");
        await markOrderRefunded({ razorpayPaymentId: paymentId });
        break;
      }
      default:
        // Unhandled event types are acknowledged and recorded, not treated as errors.
        break;
    }

    await prisma.paymentEvent.update({
      where: { id: eventRow.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.paymentEvent.update({
      where: { id: eventRow.id },
      data: { status: "FAILED", lastError: message },
    });
    console.error("razorpay webhook processing failed", message);
    // Non-200 so Razorpay retries — most failures here (e.g. a race with order
    // creation) are transient.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
