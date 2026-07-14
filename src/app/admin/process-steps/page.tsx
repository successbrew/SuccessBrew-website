import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { processStepColumns } from "@/lib/admin/schemas/process-step";
import { deleteProcessStep } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProcessStepsListPage() {
  await verifyAdminSession();
  const processSteps = await prisma.processStep.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Process Steps</h1>
        <Button asChild>
          <Link href="/admin/process-steps/new">New Process Step</Link>
        </Button>
      </div>
      <DataTable
        rows={processSteps}
        columns={processStepColumns}
        editHrefBase="/admin/process-steps"
        deleteAction={deleteProcessStep}
      />
    </div>
  );
}
