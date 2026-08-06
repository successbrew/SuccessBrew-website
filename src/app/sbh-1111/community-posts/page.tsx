import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { communityPostColumns } from "@/lib/admin/schemas/community-post";
import { deleteCommunityPost } from "./actions";

export const dynamic = "force-dynamic";

export default async function CommunityPostsListPage() {
  await verifyAdminSession();
  const communityPosts = await prisma.communityPost.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Community Posts</h1>
        <Button asChild>
          <Link href="/sbh-1111/community-posts/new">New Community Post</Link>
        </Button>
      </div>
      <DataTable
        rows={communityPosts}
        columns={communityPostColumns}
        editHrefBase="/sbh-1111/community-posts"
        deleteAction={deleteCommunityPost}
      />
    </div>
  );
}
