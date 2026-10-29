import { getSiteSettings } from "@/lib/queries/content";
import { getPublishedPosts, getTagsWithCounts } from "@/lib/blog";
import { BlogIndexClient } from "@/components/blog/BlogIndexClient";
import { BLOG_PATH } from "@/lib/blog-format";

// Cached for 60s; publishing or editing a post revalidates the blog immediately.
export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

export const metadata = {
  title: "Blogs | Successbrew Community",
  description: "Playbooks, founder stories and lessons from India's startup community — from the Successbrew team.",
  alternates: { canonical: `${SITE_URL}${BLOG_PATH}` },
  openGraph: {
    title: "The Successbrew Blog",
    description: "Playbooks, founder stories and lessons from India's startup community.",
    url: `${SITE_URL}${BLOG_PATH}`,
    type: "website",
  },
};

export default async function BlogPage() {
  const [posts, tags, siteSettings] = await Promise.all([
    getPublishedPosts().catch(() => []),
    getTagsWithCounts().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);

  return <BlogIndexClient posts={posts} tags={tags} siteSettings={siteSettings} />;
}
