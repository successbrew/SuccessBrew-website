import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { BLOG_PATH, blogPostPath, blogTagPath } from "@/lib/blog-format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

// Rebuilt at most hourly; publishing a post also revalidates it.
export const revalidate = 3600;

const STATIC_ROUTES = [
  "", "/case-studies", "/testimonials", "/personal-branding", "/founder-led-growth",
  "/community", "/community/events", "/community/podcast", "/community/offers", "/community/testimonials",
  "/about", "/about/sourabh-goyal", "/courses", BLOG_PATH,
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([
    prisma.blog.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.tag
      .findMany({ select: { slug: true, updatedAt: true, _count: { select: { posts: { where: { blog: { status: "PUBLISHED" } } } } } } })
      .catch(() => []),
  ]);

  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })),
    ...posts.map((p) => ({ url: `${SITE_URL}${blogPostPath(p.slug)}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    // Tag pages with a single post are noindexed, so they're left out here too.
    ...tags.filter((t) => t._count.posts >= 2).map((t) => ({ url: `${SITE_URL}${blogTagPath(t.slug)}`, lastModified: t.updatedAt, changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
