import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { statColumns } from "@/lib/admin/schemas/stat";
import { deleteStat } from "./actions";

export const dynamic = "force-dynamic";

export default async function StatsListPage() {
  await verifyAdminSession();
  const stats = await prisma.stat.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Stats</h1>
        <Button asChild>
          <Link href="/admin/stats/new">New Stat</Link>
        </Button>
      </div>
      <DataTable
        rows={stats}
        columns={statColumns}
        editHrefBase="/admin/stats"
        deleteAction={deleteStat}
      />
    </div>
  );
}
