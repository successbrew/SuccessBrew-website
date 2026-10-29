import { verifyAdminSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "../BlogForm";
import { createBlog } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  await verifyAdminSession();
  const tags = await prisma.tag.findMany({ select: { name: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Blog Post</h1>
      <BlogForm
        defaultValues={{
          title: "",
          slug: "",
          coverImageUrl: "",
          excerpt: "",
          body: { type: "doc", content: [{ type: "paragraph" }] },
          status: "DRAFT",
          tags: [],
        }}
        action={createBlog}
        allTags={tags.map((t) => t.name)}
      />
    </div>
  );
}
