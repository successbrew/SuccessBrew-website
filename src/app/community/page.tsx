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

export const revalidate = 0;

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
