import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validators/checkout";
import { createOrderForCheckout } from "@/lib/commerce/orders";
import { RazorpayNotConfiguredError } from "@/lib/commerce/razorpay";
import { getProductByKey, COMMUNITY_GROWTH_PRODUCT, COMMUNITY_FOUNDER_PRODUCT } from "@/lib/commerce/product";
import { isApprovedCommunityApplicant } from "@/lib/commerce/community-eligibility";
import { COMMUNITY_CHECKOUT_ENABLED } from "@/lib/commerce/community-tiers";

const COMMUNITY_TIER_KEYS = new Set([COMMUNITY_GROWTH_PRODUCT.key, COMMUNITY_FOUNDER_PRODUCT.key]);

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!(await checkRateLimit(`checkout:${ip}`, 10, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }

  const product = getProductByKey(parsed.data.productKey);
  if (!product) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }

  if (COMMUNITY_TIER_KEYS.has(product.key) && !COMMUNITY_CHECKOUT_ENABLED) {
    return NextResponse.json(
      { error: "Paid membership isn't open yet — check back soon." },
      { status: 503 }
    );
  }

  if (COMMUNITY_TIER_KEYS.has(product.key) && !(await isApprovedCommunityApplicant(parsed.data.email))) {
    return NextResponse.json(
      {
        error: "NOT_ELIGIBLE",
        message:
          "We couldn't find an approved community application for this email. Apply to join the community first, and once approved you'll be able to unlock this tier.",
      },
      { status: 403 }
    );
  }

  const { data: session } = await auth.getSession().catch(() => ({ data: null }));

  try {
    const result = await createOrderForCheckout({
      email: parsed.data.email,
      name: parsed.data.name,
      userId: session?.user?.id ?? null,
      productKey: product.key,
    });

    return NextResponse.json({
      orderId: result.orderId,
      razorpayOrderId: result.razorpayOrderId,
      amount: result.amount,
      currency: result.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    });
  } catch (err) {
    if (err instanceof RazorpayNotConfiguredError) {
      return NextResponse.json({ error: "Checkout isn't live yet — please check back soon." }, { status: 503 });
    }
    console.error("checkout creation failed", err);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 500 });
  }
}
