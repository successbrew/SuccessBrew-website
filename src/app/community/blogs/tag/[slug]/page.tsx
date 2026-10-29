import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/queries/content";
import { getPublishedPosts, getTag, getTagsWithCounts } from "@/lib/blog";
import { BlogIndexClient } from "@/components/blog/BlogIndexClient";
import { blogTagPath } from "@/lib/blog-format";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tag, posts] = await Promise.all([getTag(slug).catch(() => null), getPublishedPosts(slug).catch(() => [])]);
  if (!tag) return {};
  const description = tag.description || `Successbrew articles on ${tag.name} — playbooks, founder stories and lessons.`;
  return {
    title: `${tag.name} | Successbrew Blog`,
    description,
    alternates: { canonical: `${SITE_URL}${blogTagPath(tag.slug)}` },
    openGraph: { title: `${tag.name} — Successbrew Blog`, description, url: `${SITE_URL}${blogTagPath(tag.slug)}`, type: "website" },
    // A tag page with a single post is thin content — keep it out of search
    // results until it has more, but let crawlers follow its links.
    robots: posts.length < 2 ? { index: false, follow: true } : undefined,
  };
}

export default async function BlogTagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tag, posts, tags, siteSettings] = await Promise.all([
    getTag(slug).catch(() => null),
    getPublishedPosts(slug).catch(() => []),
    getTagsWithCounts().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);
  if (!tag || posts.length === 0) notFound();

  return (
    <BlogIndexClient
      posts={posts}
      tags={tags}
      siteSettings={siteSettings}
      activeTag={{ name: tag.name, slug: tag.slug, description: tag.description, count: posts.length }}
    />
  );
}
