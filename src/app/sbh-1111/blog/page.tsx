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

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  await verifyAdminSession();
  const posts = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <Button asChild>
          <Link href="/sbh-1111/blog/new">New Post</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
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
                <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                  {post.status === "PUBLISHED" ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>{post.authorName ?? "—"}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/sbh-1111/blog/${post.id}/edit`}>Edit</Link>
                </Button>
                <DeleteRowButton id={post.id} action={deleteBlog} />
              </TableCell>
            </TableRow>
          ))}
          {posts.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No posts yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
