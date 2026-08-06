import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { communityWinColumns } from "@/lib/admin/schemas/community-win";
import { deleteCommunityWin } from "./actions";

export const dynamic = "force-dynamic";

export default async function CommunityWinsListPage() {
  await verifyAdminSession();
  const communityWins = await prisma.communityWin.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Community Wins</h1>
        <Button asChild>
          <Link href="/sbh-1111/community-wins/new">New Community Win</Link>
        </Button>
      </div>
      <DataTable
        rows={communityWins}
        columns={communityWinColumns}
        editHrefBase="/sbh-1111/community-wins"
        deleteAction={deleteCommunityWin}
      />
    </div>
  );
}
