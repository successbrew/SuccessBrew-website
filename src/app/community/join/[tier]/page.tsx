import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/queries/content";
import { COMMUNITY_TIER_COPY, COMMUNITY_CHECKOUT_ENABLED, type CommunityTier } from "@/lib/commerce/community-tiers";
import { CommunityJoinClient } from "@/components/CommunityJoinClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content.
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ tier: string }> }) {
  const { tier } = await params;
  const copy = COMMUNITY_TIER_COPY[tier as CommunityTier];
  if (!copy) return {};
  return {
    title: `${copy.heading} | Successbrew`,
    description: copy.tagline,
  };
}

export default async function CommunityJoinPage({ params }: { params: Promise<{ tier: string }> }) {
  const { tier } = await params;
  const copy = COMMUNITY_TIER_COPY[tier as CommunityTier];
  if (!copy) notFound();

  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    instagramUrl2: null,
    linkedinUrl: null,
    youtubeUrl: null,
  }));

  return (
    <CommunityJoinClient
      siteSettings={siteSettings}
      tier={tier as CommunityTier}
      heading={copy.heading}
      tagline={copy.tagline}
      features={copy.features}
      enabled={COMMUNITY_CHECKOUT_ENABLED}
      product={{
        key: copy.product.key,
        title: copy.product.title,
        amount: copy.product.amount,
        currency: copy.product.currency,
      }}
    />
  );
}
