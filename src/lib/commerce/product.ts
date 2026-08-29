export interface Product {
  key: string;
  title: string;
  /** Amount in paise (Razorpay's unit). */
  amount: number;
  /** MRP shown for strike-through pricing, in paise. Optional — the community
   * tiers don't need a strike-through price like the offer does. */
  mrpAmount?: number;
  currency: string;
  /** Resource.slug that gets access-granted the moment this product is paid for. */
  resourceSlug: string;
}

/**
 * Single source of truth for the ₹2,999 offer. Amount is defined here, server-side,
 * and never trusted from the client — the checkout API always uses this constant.
 */
export const OFFER_PRODUCT = {
  key: "successbrew-community-2999",
  title: "Successbrew Community + Course Access",
  amount: 299900,
  mrpAmount: 499900,
  currency: "INR",
  resourceSlug: "community-course-access",
};

/** Paid community tier, unlocked only for applicants an admin has approved
 * (see src/lib/commerce/community-eligibility.ts) — a one-time payment gets
 * them a premium WhatsApp group invite + perks delivered manually inside it. */
export const COMMUNITY_GROWTH_PRODUCT = {
  key: "successbrew-community-growth",
  title: "Successbrew Growth Membership",
  amount: 500000,
  currency: "INR",
  resourceSlug: "community-growth-perks",
};

export const COMMUNITY_FOUNDER_PRODUCT = {
  key: "successbrew-community-founder",
  title: "Successbrew Founder Membership",
  amount: 10000000,
  currency: "INR",
  resourceSlug: "community-founder-perks",
};

export const PRODUCTS: Record<string, Product> = {
  [OFFER_PRODUCT.key]: OFFER_PRODUCT,
  [COMMUNITY_GROWTH_PRODUCT.key]: COMMUNITY_GROWTH_PRODUCT,
  [COMMUNITY_FOUNDER_PRODUCT.key]: COMMUNITY_FOUNDER_PRODUCT,
};

export function getProductByKey(key: string): Product | null {
  return PRODUCTS[key] ?? null;
}
