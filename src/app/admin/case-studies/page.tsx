import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { caseStudyColumns } from "@/lib/admin/schemas/case-study";
import { deleteCaseStudy } from "./actions";

export const dynamic = "force-dynamic";

export default async function CaseStudiesListPage() {
  await verifyAdminSession();
  const caseStudies = await prisma.caseStudy.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Case Studies</h1>
        <Button asChild>
          <Link href="/admin/case-studies/new">New Case Study</Link>
        </Button>
      </div>
      <DataTable
        rows={caseStudies}
        columns={caseStudyColumns}
        editHrefBase="/admin/case-studies"
        deleteAction={deleteCaseStudy}
      />
    </div>
  );
}
