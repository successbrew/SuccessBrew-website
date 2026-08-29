import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProductByKey } from "@/lib/commerce/product";

/** Polled by the /offer/success page. Deliberately returns only status + a
 * redirect URL — no PII — since the orderId (an unguessable cuid) is the only
 * auth this endpoint has. */
export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let redirectUrl: string | null = null;
  if (order.status === "PAID") {
    const product = getProductByKey(order.productKey);
    const resource = product
      ? await prisma.resource.findUnique({ where: { slug: product.resourceSlug } })
      : null;
    redirectUrl = resource?.url ?? null;
  }

  return NextResponse.json({ status: order.status, redirectUrl });
}
