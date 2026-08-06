"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { blogSchema, type BlogInput } from "@/lib/admin/schemas/blog";
import type { ActionResult } from "@/lib/admin/crud";

const REVALIDATE = ["/sbh-1111/blog", "/blog"];

export async function createBlog(input: BlogInput): Promise<ActionResult> {
  const admin = await verifyAdminSession();
  const parsed = blogSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };

  const existing = await prisma.blog.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { error: "A post with this slug already exists." };

  await prisma.blog.create({
    data: {
      ...parsed.data,
      authorId: admin.id,
      authorName: admin.name ?? admin.email,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  REVALIDATE.forEach((p) => revalidatePath(p));
  return { success: true };
}

export async function updateBlog(id: string, input: BlogInput): Promise<ActionResult> {
  await verifyAdminSession();
  const parsed = blogSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };

  const existing = await prisma.blog.findUnique({ where: { slug: parsed.data.slug } });
  if (existing && existing.id !== id) return { error: "A post with this slug already exists." };

  const current = await prisma.blog.findUnique({ where: { id } });
  if (!current) return { error: "Post not found." };
  const nowPublishing = parsed.data.status === "PUBLISHED" && current.status !== "PUBLISHED";

  await prisma.blog.update({
    where: { id },
    data: {
      ...parsed.data,
      publishedAt: nowPublishing ? new Date() : current.publishedAt,
    },
  });

  REVALIDATE.forEach((p) => revalidatePath(p));
  return { success: true };
}

export async function deleteBlog(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };

  await prisma.blog.delete({ where: { id } });
  REVALIDATE.forEach((p) => revalidatePath(p));
  return { success: true };
}
