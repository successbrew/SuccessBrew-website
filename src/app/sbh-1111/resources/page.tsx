import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { resourceColumns } from "@/lib/admin/schemas/resource";
import { deleteResource } from "./actions";

export const dynamic = "force-dynamic";

export default async function ResourcesListPage() {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  const resources = await prisma.resource.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resources</h1>
          <p className="text-sm text-muted-foreground">
            What paid customers get access to after checkout — e.g. the Koursely course link.
          </p>
        </div>
        <Button asChild>
          <Link href="/sbh-1111/resources/new">New Resource</Link>
        </Button>
      </div>
      <DataTable
        rows={resources}
        columns={resourceColumns}
        editHrefBase="/sbh-1111/resources"
        deleteAction={deleteResource}
      />
    </div>
  );
}
