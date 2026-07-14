import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { brandPartnerColumns } from "@/lib/admin/schemas/brand-partner";
import { deleteCommunityPartner } from "./actions";

export const dynamic = "force-dynamic";

export default async function CommunityPartnersListPage() {
  await verifyAdminSession();
  const communityPartners = await prisma.brandPartner.findMany({
    where: { group: "COMMUNITY_PARTNER" },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Community Partners</h1>
        <Button asChild>
          <Link href="/admin/community-partners/new">New Community Partner</Link>
        </Button>
      </div>
      <DataTable
        rows={communityPartners}
        columns={brandPartnerColumns}
        editHrefBase="/admin/community-partners"
        deleteAction={deleteCommunityPartner}
      />
    </div>
  );
}
