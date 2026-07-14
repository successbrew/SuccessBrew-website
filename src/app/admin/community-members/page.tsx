import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { brandPartnerColumns } from "@/lib/admin/schemas/brand-partner";
import { deleteCommunityMember } from "./actions";

export const dynamic = "force-dynamic";

export default async function CommunityMembersListPage() {
  await verifyAdminSession();
  const communityMembers = await prisma.brandPartner.findMany({
    where: { group: "COMMUNITY_MEMBER" },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Community Members</h1>
        <Button asChild>
          <Link href="/admin/community-members/new">New Community Member</Link>
        </Button>
      </div>
      <DataTable
        rows={communityMembers}
        columns={brandPartnerColumns}
        editHrefBase="/admin/community-members"
        deleteAction={deleteCommunityMember}
      />
    </div>
  );
}
