/** Client-safe blog types and formatting (no database imports). */

/** The blog lives inside the Community section. */
export const BLOG_PATH = "/community/blogs";
export const blogPostPath = (slug: string) => `${BLOG_PATH}/${slug}`;
export const blogTagPath = (slug: string) => `${BLOG_PATH}/tag/${slug}`;

export interface PostCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  authorName: string | null;
  readingMinutes: number;
  tags: { name: string; slug: string }[];
}

export interface TocEntry { id: string; text: string }

export interface TagCount {
  name: string;
  slug: string;
  description: string | null;
  count: number;
}

/** Post dates are shown in India time so server and browser always agree. */
export function formatPostDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}
