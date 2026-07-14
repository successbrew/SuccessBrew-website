import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/generic/DataTable";
import { deleteBlog } from "./actions";
import type { Blog } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  await verifyAdminSession();
  const posts = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <Button asChild>
          <Link href="/admin/blog/new">New Post</Link>
        </Button>
      </div>
      <DataTable
        rows={posts}
        columns={[
          { key: "title", label: "Title" },
          { key: "slug", label: "Slug" },
          {
            key: "status",
            label: "Status",
            render: (row: Blog) => (
              <Badge variant={row.status === "PUBLISHED" ? "default" : "secondary"}>
                {row.status === "PUBLISHED" ? "Published" : "Draft"}
              </Badge>
            ),
          },
          { key: "authorName", label: "Author" },
        ]}
        editHrefBase="/admin/blog"
        deleteAction={deleteBlog}
      />
    </div>
  );
}
