import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { buildApplicationsWorkbook } from "@/lib/services/applications/export-excel";
import type { PersonalInfo, ProfessionalInfo } from "@/lib/types/application";

export async function GET() {
  await requirePermission(PERMISSIONS.APPLICATIONS_REVIEW);

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, subCategory: true },
  });

  const buffer = await buildApplicationsWorkbook(
    applications.map((app) => ({
      applicationCode: app.applicationCode,
      status: app.status,
      submittedAt: app.submittedAt,
      categoryLabel: app.category?.label ?? "",
      subCategoryLabel: app.subCategory?.label ?? "",
      personal: app.personal as unknown as PersonalInfo,
      professional: app.professional as unknown as ProfessionalInfo,
    }))
  );

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="successbrew-applications-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
