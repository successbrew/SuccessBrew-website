"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { blogSchema, tagSchema, type BlogInput } from "@/lib/admin/schemas/blog";
import { cleanTagNames, normalizeTagName, tagSlug } from "@/lib/blog";
import type { ActionResult } from "@/lib/admin/crud";
import { BLOG_PATH } from "@/lib/blog-format";

/** Refreshes the admin list plus every public blog page (index, posts, tag pages). */
function revalidateBlog() {
  revalidatePath("/sbh-1111/blog", "layout");
  revalidatePath(BLOG_PATH, "layout");
  revalidatePath("/community"); // the Learning Hub links to the blog
  revalidatePath("/sitemap.xml");
}

/** Replaces a post's tags: existing tags are matched by slug, new ones created. */
async function syncTags(tx: Prisma.TransactionClient, blogId: string, names: string[]) {
  const tags = await Promise.all(
    cleanTagNames(names).map(({ name, slug }) =>
      tx.tag.upsert({ where: { slug }, update: {}, create: { name, slug } })
    )
  );
  await tx.blogTag.deleteMany({ where: { blogId } });
  if (tags.length) await tx.blogTag.createMany({ data: tags.map((t) => ({ blogId, tagId: t.id })) });
}

export async function createBlog(input: BlogInput): Promise<ActionResult> {
  const admin = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  const parsed = blogSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  const { tags, ...data } = parsed.data;

  const existing = await prisma.blog.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "A post with this slug already exists." };

  await prisma.$transaction(async (tx) => {
    const post = await tx.blog.create({
      data: {
        ...data,
        authorId: admin.id,
        authorName: admin.name ?? admin.email,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    await syncTags(tx, post.id, tags);
  });

  revalidateBlog();
  return { success: true };
}

export async function updateBlog(id: string, input: BlogInput): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  const parsed = blogSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  const { tags, ...data } = parsed.data;

  const existing = await prisma.blog.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) return { error: "A post with this slug already exists." };

  const current = await prisma.blog.findUnique({ where: { id } });
  if (!current) return { error: "Post not found." };
  const nowPublishing = data.status === "PUBLISHED" && current.status !== "PUBLISHED";

  await prisma.$transaction(async (tx) => {
    await tx.blog.update({
      where: { id },
      data: {
        ...data,
        publishedAt: nowPublishing ? new Date() : current.publishedAt,
      },
    });
    await syncTags(tx, id, tags);
  });

  revalidateBlog();
  return { success: true };
}

export async function deleteBlog(formData: FormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };

  await prisma.blog.delete({ where: { id } });
  revalidateBlog();
  return { success: true };
}

/* ── Tag management ─────────────────────────────────────────────────────── */

export async function updateTag(id: string, input: { name: string; description?: string }): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };

  const name = normalizeTagName(parsed.data.name);
  const slug = tagSlug(name);
  if (!slug) return { error: "Use at least one letter or number." };
  const clash = await prisma.tag.findUnique({ where: { slug } });
  if (clash && clash.id !== id) return { error: `"${clash.name}" already exists — merge into it instead.` };

  await prisma.tag.update({ where: { id }, data: { name, slug, description: parsed.data.description || null } });
  revalidateBlog();
  return { success: true };
}

/** Moves every post from one tag onto another, then removes the old tag. */
export async function mergeTag(fromId: string, intoId: string): Promise<ActionResult> {
  const admin = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!hasPermission(admin.roles, PERMISSIONS.SETTINGS_MANAGE)) return { error: "Only admins can merge tags." };
  if (fromId === intoId) return { error: "Pick a different tag to merge into." };

  await prisma.$transaction(async (tx) => {
    const links = await tx.blogTag.findMany({ where: { tagId: fromId }, select: { blogId: true } });
    if (links.length) {
      await tx.blogTag.createMany({ data: links.map((l) => ({ blogId: l.blogId, tagId: intoId })), skipDuplicates: true });
    }
    await tx.tag.delete({ where: { id: fromId } });
  });
  revalidateBlog();
  return { success: true };
}

export async function deleteTag(formData: FormData): Promise<ActionResult> {
  const admin = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!hasPermission(admin.roles, PERMISSIONS.SETTINGS_MANAGE)) return { error: "Only admins can delete tags." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };

  // BlogTag rows cascade; the posts themselves are untouched.
  await prisma.tag.delete({ where: { id } });
  revalidateBlog();
  return { success: true };
}
