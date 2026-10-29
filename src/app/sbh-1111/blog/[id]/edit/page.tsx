import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { BlogForm } from "../../BlogForm";
import { updateBlog } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const [post, tags] = await Promise.all([
    prisma.blog.findUnique({ where: { id }, include: { tags: { select: { tag: { select: { name: true } } } } } }),
    prisma.tag.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Blog Post</h1>
      <BlogForm
        defaultValues={{
          title: post.title,
          slug: post.slug,
          coverImageUrl: post.coverImageUrl ?? "",
          excerpt: post.excerpt ?? "",
          body: post.body as JSONContent,
          status: post.status,
          tags: post.tags.map((t) => t.tag.name),
        }}
        action={updateBlog.bind(null, post.id)}
        allTags={tags.map((t) => t.name)}
      />
    </div>
  );
}
