import { getPodcastEpisodes, getSiteSettings } from "@/lib/queries/content";
import { CommunityPodcastPageClient } from "@/components/CommunityPodcastPageClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content.
export const revalidate = 60;

export const metadata = {
  title: "All Episodes | Successbrew Podcast",
  description: "Every episode of the Successbrew Podcast — raw conversations with India's most ambitious founders.",
};

export default async function CommunityPodcastPage() {
  const [episodes, siteSettings] = await Promise.all([
    getPodcastEpisodes().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);

  return <CommunityPodcastPageClient episodes={episodes} siteSettings={siteSettings} />;
}
