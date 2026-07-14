import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { serviceColumns } from "@/lib/admin/schemas/service";
import { deleteService } from "./actions";

export const dynamic = "force-dynamic";

export default async function ServicesListPage() {
  await verifyAdminSession();
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Services</h1>
        <Button asChild>
          <Link href="/admin/services/new">New Service</Link>
        </Button>
      </div>
      <DataTable
        rows={services}
        columns={serviceColumns}
        editHrefBase="/admin/services"
        deleteAction={deleteService}
      />
    </div>
  );
}
