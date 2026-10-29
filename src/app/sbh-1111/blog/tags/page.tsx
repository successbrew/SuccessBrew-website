import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { TagManager } from "./TagManager";

export const dynamic = "force-dynamic";

export default async function BlogTagsPage() {
  await verifyAdminSession();
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { posts: true } },
      posts: { where: { blog: { status: "PUBLISHED" } }, select: { blogId: true } },
    },
  });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog Tags</h1>
        <Button variant="outline" asChild>
          <Link href="/sbh-1111/blog">← Back to posts</Link>
        </Button>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Tags are created from the post editor. Rename or describe them here, merge near-duplicates (e.g. &ldquo;Branding&rdquo;
        into &ldquo;Personal Branding&rdquo;), or delete unused ones. Each tag with published posts has a public page at /community/blogs/tag/&lt;slug&gt;.
      </p>
      <TagManager
        tags={tags.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description ?? "",
          total: t._count.posts,
          published: t.posts.length,
        }))}
      />
    </div>
  );
}
