import {
  getCommunityEvents,
  getPodcastEpisodes,
  getCommunityWins,
  getCommunityPosts,
  getCommunityPartners,
  getCommunityMembers,
  getSiteSettings,
} from "@/lib/queries/content";
import { CommunityPageClient } from "@/components/CommunityPageClient";

export const revalidate = 0;

export default async function CommunityPage() {
  const [events, episodes, wins, posts, communityPartners, communityMembers, siteSettings] = await Promise.all([
    getCommunityEvents().catch(() => []),
    getPodcastEpisodes().catch(() => []),
    getCommunityWins().catch(() => []),
    getCommunityPosts().catch(() => []),
    getCommunityPartners().catch(() => []),
    getCommunityMembers().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, linkedinUrl: null, youtubeUrl: null, twitterUrl: null, facebookUrl: null })),
  ]);

  return (
    <CommunityPageClient
      events={events}
      episodes={episodes}
      wins={wins}
      posts={posts}
      communityPartners={communityPartners}
      communityMembers={communityMembers}
      siteSettings={siteSettings}
    />
  );
}
