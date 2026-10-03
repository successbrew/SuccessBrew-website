import { prisma } from "@/lib/prisma";
import { fetchRazorpay } from "./razorpay";
import { markOrderPaidFromWebhook, markOrderRefunded } from "./orders";

type Payment = { id: string; order_id: string; amount: number; currency: string; status: string; captured: boolean; amount_refunded: number };
type Refund = { id: string; payment_id: string; amount: number; status: string };

/** Rotate through all unsettled and paid orders, including old missed refunds. */
export async function reconcilePayments() {
  const orders = await prisma.order.findMany({
    where: { provider: "razorpay", providerOrderId: { not: null }, status: { in: ["INITIATED", "PENDING", "FAILED", "PAID"] } },
    orderBy: [{ reconciledAt: { sort: "asc", nulls: "first" } }, { id: "asc" }], take: 25,
  });
  let failed = 0;
  for (const order of orders) {
    try {
      const payments = await fetchRazorpay<{ items: Payment[] }>(`orders/${encodeURIComponent(order.providerOrderId!)}/payments`);
      for (const payment of payments.items) {
        if (payment.order_id !== order.providerOrderId) throw new Error("Provider order mismatch");
        if (payment.status !== "captured" && !(payment.status === "refunded" && payment.captured)) continue;
        await markOrderPaidFromWebhook({ razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id,
          amount: payment.amount, currency: payment.currency, paymentStatus: "captured" });
        if (payment.amount_refunded > 0) {
          for (let skip = 0; ; skip += 100) {
            const refunds = await fetchRazorpay<{ items: Refund[] }>(`payments/${encodeURIComponent(payment.id)}/refunds?count=100&skip=${skip}`);
            for (const refund of refunds.items) {
              if (refund.payment_id !== payment.id) throw new Error("Provider refund payment mismatch");
              if (refund.status === "processed") await markOrderRefunded({ razorpayPaymentId: payment.id, refundId: refund.id, amount: refund.amount });
            }
            if (refunds.items.length < 100) break;
          }
        }
      }
    } catch (error) {
      failed++;
      console.error("Payment reconciliation failed", order.id, error);
    } finally {
      await prisma.order.update({ where: { id: order.id }, data: { reconciledAt: new Date() } });
    }
  }
  return { checked: orders.length, failed };
}
