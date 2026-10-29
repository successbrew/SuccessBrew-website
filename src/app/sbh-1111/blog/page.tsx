import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DeleteRowButton } from "@/components/admin/generic/DeleteRowButton";
import { deleteBlog } from "./actions";
import { blogPostPath } from "@/lib/blog-format";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  await verifyAdminSession();
  const posts = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    include: { tags: { select: { tag: { select: { name: true } } } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/sbh-1111/blog/tags">Manage tags</Link>
          </Button>
          <Button asChild>
            <Link href="/sbh-1111/blog/new">New Post</Link>
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Author</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.slug}</TableCell>
              <TableCell>
                <div className="flex max-w-[16rem] flex-wrap gap-1">
                  {post.tags.length ? post.tags.map((t) => (
                    <Badge key={t.tag.name} variant="outline" className="font-normal">{t.tag.name}</Badge>
                  )) : <span className="text-muted-foreground">—</span>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                  {post.status === "PUBLISHED" ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>{post.authorName ?? "—"}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                {post.status === "PUBLISHED" && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={blogPostPath(post.slug)} target="_blank" rel="noreferrer">View</a>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/sbh-1111/blog/${post.id}/edit`}>Edit</Link>
                </Button>
                <DeleteRowButton id={post.id} action={deleteBlog} />
              </TableCell>
            </TableRow>
          ))}
          {posts.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No posts yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
