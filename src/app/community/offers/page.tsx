import { getSiteSettings } from "@/lib/queries/content";
import { CommunityOffersPageClient } from "@/components/CommunityOffersPageClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content.
export const revalidate = 60;

export const metadata = {
  title: "Community Offers | Successbrew",
  description: "Free to join, always. See what the Growth and Founder tiers unlock inside the Successbrew community.",
};

export default async function CommunityOffersPage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    instagramUrl2: null,
    linkedinUrl: null,
    youtubeUrl: null,
  }));

  return <CommunityOffersPageClient siteSettings={siteSettings} />;
}
