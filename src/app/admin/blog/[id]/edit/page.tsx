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
  const post = await prisma.blog.findUnique({ where: { id } });
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
        }}
        action={updateBlog.bind(null, post.id)}
      />
    </div>
  );
}
