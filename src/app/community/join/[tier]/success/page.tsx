import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/queries/content";
import { CommunityJoinSuccessClient } from "@/components/CommunityJoinSuccessClient";
import { COMMUNITY_TIERS, type CommunityTier } from "@/lib/commerce/community-tiers";

export const revalidate = 0;

const VALID_TIERS = new Set<CommunityTier>(COMMUNITY_TIERS);

export default async function CommunityJoinSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ tier: string }>;
  searchParams: Promise<{ orderId?: string; email?: string }>;
}) {
  const { tier } = await params;
  if (!VALID_TIERS.has(tier as CommunityTier)) notFound();

  const { orderId, email } = await searchParams;

  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    instagramUrl2: null,
    linkedinUrl: null,
    youtubeUrl: null,
  }));

  return (
    <CommunityJoinSuccessClient
      orderId={orderId ?? null}
      email={email ?? null}
      siteSettings={siteSettings}
      tier={tier as CommunityTier}
    />
  );
}
