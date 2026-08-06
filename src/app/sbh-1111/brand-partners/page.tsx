import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { brandPartnerColumns } from "@/lib/admin/schemas/brand-partner";
import { deleteBrandPartner } from "./actions";

export const dynamic = "force-dynamic";

export default async function BrandPartnersListPage() {
  await verifyAdminSession();
  const brandPartners = await prisma.brandPartner.findMany({
    where: { group: "SERVICES_HOMEPAGE" },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Brand Partners</h1>
        <Button asChild>
          <Link href="/sbh-1111/brand-partners/new">New Brand Partner</Link>
        </Button>
      </div>
      <DataTable
        rows={brandPartners}
        columns={brandPartnerColumns}
        editHrefBase="/sbh-1111/brand-partners"
        deleteAction={deleteBrandPartner}
      />
    </div>
  );
}
