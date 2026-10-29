import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import type { JSONContent } from "@tiptap/react";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/admin/schemas/blog";
import type { PostCard, TagCount, TocEntry } from "@/lib/blog-format";

export type { PostCard, TagCount, TocEntry } from "@/lib/blog-format";

/* ── Tags ──────────────────────────────────────────────────────────────── */

export const MAX_TAGS_PER_POST = 6;

/** "  personal   branding " → "Personal Branding". Keeps all-caps words (D2C, AI)
 * as typed so acronyms survive. */
export function normalizeTagName(raw: string) {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40)
    .split(" ")
    .map((w) => (w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export function tagSlug(name: string) {
  return slugify(name).replace(/^-+|-+$/g, "");
}

/** Clean, de-duplicated (by slug) tag names, capped at MAX_TAGS_PER_POST. */
export function cleanTagNames(names: string[]) {
  const seen = new Set<string>();
  const out: { name: string; slug: string }[] = [];
  for (const raw of names) {
    const name = normalizeTagName(raw);
    const slug = tagSlug(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ name, slug });
    if (out.length === MAX_TAGS_PER_POST) break;
  }
  return out;
}

/* ── Rendering ─────────────────────────────────────────────────────────── */

// StarterKit v3 already bundles Link, so only Image is added on top.
const EXTENSIONS = [StarterKit, Image];
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;
const SAFE_SRC = /^(https?:|\/)/i;

/** Drops link marks and images whose URL isn't http(s)/mailto/tel/relative, so a
 * pasted `javascript:` URL can never reach the rendered page. */
function sanitize(node: JSONContent): JSONContent {
  const marks = node.marks?.filter((m) => m.type !== "link" || SAFE_HREF.test(String(m.attrs?.href ?? "")));
  if (node.type === "image" && !SAFE_SRC.test(String(node.attrs?.src ?? ""))) return { type: "paragraph" };
  return { ...node, marks, content: node.content?.map(sanitize) };
}

function plainText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(plainText).join(node.type === "paragraph" || node.type === "heading" ? " " : "");
}

/** Article HTML plus a table of contents built from its H2s (each H2 gets a
 * stable id to link to) and an estimated reading time. */
export function renderPost(body: unknown) {
  const doc = sanitize((body as JSONContent) ?? { type: "doc", content: [] });
  const toc: TocEntry[] = [];
  const used = new Set<string>();
  for (const n of doc.content ?? []) {
    if (n.type === "heading" && n.attrs?.level === 2) {
      const text = plainText(n).trim();
      if (!text) continue;
      let id = tagSlug(text) || "section";
      for (let i = 2; used.has(id); i++) id = `${tagSlug(text)}-${i}`;
      used.add(id);
      toc.push({ id, text });
    }
  }
  let html = "";
  try {
    html = generateHTML(doc, EXTENSIONS);
  } catch {
    html = "";
  }
  // generateHTML can't emit ids, so add them to the H2s in document order.
  let k = 0;
  html = html.replace(/<h2>/g, () => (toc[k] ? `<h2 id="${toc[k++].id}">` : "<h2>"));
  const words = plainText(doc).split(/\s+/).filter(Boolean).length;
  return { html, toc, readingMinutes: Math.max(1, Math.round(words / 220)) };
}

/* ── Queries (published posts only) ────────────────────────────────────── */

const cardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImageUrl: true,
  publishedAt: true,
  authorName: true,
  body: true,
  tags: { select: { tag: { select: { name: true, slug: true } } }, orderBy: { tag: { name: "asc" as const } } },
} as const;

type CardRow = {
  id: string; title: string; slug: string; excerpt: string | null; coverImageUrl: string | null;
  publishedAt: Date | null; authorName: string | null; body: unknown; tags: { tag: { name: string; slug: string } }[];
};

function toCard(p: CardRow): PostCard {
  const words = plainText((p.body as JSONContent) ?? {}).split(/\s+/).filter(Boolean).length;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    authorName: p.authorName,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    tags: p.tags.map((t) => t.tag),
  };
}

const published = { status: "PUBLISHED" as const };
const newestFirst = [{ publishedAt: "desc" as const }, { createdAt: "desc" as const }];

export async function getPublishedPosts(tag?: string): Promise<PostCard[]> {
  const rows = await prisma.blog.findMany({
    where: tag ? { ...published, tags: { some: { tag: { slug: tag } } } } : published,
    orderBy: newestFirst,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function getPublishedPost(slug: string) {
  return prisma.blog.findFirst({
    where: { ...published, slug },
    include: { tags: { select: { tag: { select: { id: true, name: true, slug: true } } }, orderBy: { tag: { name: "asc" } } } },
  });
}

/** Tags that have at least one published post, with counts, busiest first. */
export async function getTagsWithCounts(): Promise<TagCount[]> {
  const tags = await prisma.tag.findMany({
    select: { name: true, slug: true, description: true, _count: { select: { posts: { where: { blog: published } } } } },
  });
  return tags
    .map((t) => ({ name: t.name, slug: t.slug, description: t.description, count: t._count.posts }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getTag(slug: string) {
  return prisma.tag.findUnique({ where: { slug }, select: { name: true, slug: true, description: true } });
}

/** Posts sharing the most tags with this one; topped up with the latest posts. */
export async function getRelatedPosts(postId: string, tagIds: string[], take = 3): Promise<PostCard[]> {
  const shared = tagIds.length
    ? await prisma.blog.findMany({
        where: { ...published, id: { not: postId }, tags: { some: { tagId: { in: tagIds } } } },
        select: { ...cardSelect, tags: { select: { tagId: true, tag: { select: { name: true, slug: true } } } } },
        orderBy: newestFirst,
        take: 20,
      })
    : [];
  const ranked = shared
    .map((p) => ({ p, score: p.tags.filter((t) => tagIds.includes(t.tagId)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .map(({ p }) => toCard(p));
  if (ranked.length >= take) return ranked;
  const latest = await prisma.blog.findMany({
    where: { ...published, id: { notIn: [postId, ...ranked.map((r) => r.id)] } },
    orderBy: newestFirst,
    select: cardSelect,
    take: take - ranked.length,
  });
  return [...ranked, ...latest.map(toCard)];
}

