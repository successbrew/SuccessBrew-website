import { COMMUNITY_GROWTH_PRODUCT, COMMUNITY_FOUNDER_PRODUCT } from "./product";

/** Paid Growth/Founder checkout. While false, /community/join/[tier] shows a
 * "coming soon" state and the checkout API refuses to create orders for these
 * two productKeys — flip back to false to pause without deleting any code.
 *
 * Live (true): the actual checkout flow works — this is what the links in
 * the "you're approved" email point at, so approved applicants can pay.
 * Separately, the public /community pricing cards don't link here at all
 * (see membershipTiers' `comingSoon` flag in CommunityPageClient.tsx) — a
 * random visitor clicking the ₹5,000/₹1,00,000 card sees "Coming soon"
 * regardless of this flag, since that's a UI-level gate on the marketing
 * page, not on the checkout flow itself. */
export const COMMUNITY_CHECKOUT_ENABLED = true;

export const COMMUNITY_TIER_COPY = {
  growth: {
    product: COMMUNITY_GROWTH_PRODUCT,
    heading: "Become a Growth Member",
    tagline: "For members ready to plug into mentorship, content and priority access.",
    features: [
      "Everything in Free",
      "Premium WhatsApp group + daily business updates",
      "Priority seats at every event",
      "Mentor Match programme access",
      "Discounted content studio sessions",
      "Learning Hub premium resources",
    ],
  },
  founder: {
    product: COMMUNITY_FOUNDER_PRODUCT,
    heading: "Become a Founder Member",
    tagline: "Our top tier — deep access, real relationships, and hands-on support.",
    features: [
      "Everything in Growth",
      "Invites to Retreats (fun, learning, wellness)",
      "1:1 concierge intros to experts & VCs",
      "Free content studio production day",
      "Direct line to the Successbrew team",
    ],
  },
} as const;

export type CommunityTier = keyof typeof COMMUNITY_TIER_COPY;

export const COMMUNITY_TIERS = Object.keys(COMMUNITY_TIER_COPY) as CommunityTier[];
