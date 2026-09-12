import {
  getCommunityEvents,
  getPodcastEpisodes,
  getCommunityTestimonials,
  getCommunityPosts,
  getCommunityPartners,
  getCommunityMembers,
  getSiteSettings,
} from "@/lib/queries/content";
import { CommunityPageClient } from "@/components/CommunityPageClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content.
export const revalidate = 60;

export default async function CommunityPage() {
  const [events, episodes, communityTestimonials, posts, communityPartners, communityMembers, siteSettings] = await Promise.all([
    getCommunityEvents().catch(() => []),
    getPodcastEpisodes().catch(() => []),
    getCommunityTestimonials().catch(() => []),
    getCommunityPosts().catch(() => []),
    getCommunityPartners().catch(() => []),
    getCommunityMembers().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);

  return (
    <CommunityPageClient
      events={events}
      episodes={episodes}
      communityTestimonials={communityTestimonials}
      posts={posts}
      communityPartners={communityPartners}
      communityMembers={communityMembers}
      siteSettings={siteSettings}
    />
  );
}
