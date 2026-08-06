import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { STATUS_LABELS } from "@/lib/services/applications/status-transitions";
import { ApplicationStatus } from "@prisma/client";
import type { PersonalInfo, ProfessionalInfo } from "@/lib/types/application";

export const dynamic = "force-dynamic";

const FILTER_STATUSES = Object.values(ApplicationStatus).filter((s) => s !== ApplicationStatus.DRAFT);

export default async function ApplicationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission(PERMISSIONS.APPLICATIONS_REVIEW);
  const { status } = await searchParams;
  const activeStatus = status && (FILTER_STATUSES as ApplicationStatus[]).includes(status as ApplicationStatus)
    ? (status as ApplicationStatus)
    : undefined;

  const [applications, counts] = await Promise.all([
    prisma.application.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      orderBy: { createdAt: "desc" },
      include: { category: true, subCategory: true },
    }),
    prisma.application.groupBy({ by: ["status"], _count: true }),
  ]);
  const countByStatus = new Map(counts.map((c) => [c.status, c._count]));
  const totalCount = counts.reduce((sum, c) => sum + c._count, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Speaker Applications</h1>
          <p className="text-muted-foreground">
            {applications.length} application{applications.length !== 1 ? "s" : ""} {activeStatus ? "in this view" : "received"}.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/applications/export">Export to Excel</Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/applications">
          <Badge variant={!activeStatus ? "default" : "secondary"} className="cursor-pointer">
            All ({totalCount})
          </Badge>
        </Link>
        {FILTER_STATUSES.map((s) => {
          const count = countByStatus.get(s) ?? 0;
          if (count === 0) return null;
          return (
            <Link key={s} href={`/admin/applications?status=${s}`}>
              <Badge variant={activeStatus === s ? "default" : "secondary"} className="cursor-pointer">
                {STATUS_LABELS[s]} ({count})
              </Badge>
            </Link>
          );
        })}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sub Category</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => {
            const personal = app.personal as unknown as PersonalInfo;
            const professional = app.professional as unknown as ProfessionalInfo;
            return (
              <TableRow key={app.id}>
                <TableCell>{personal.firstName} {personal.lastName}</TableCell>
                <TableCell>{professional.companyName ?? "—"}</TableCell>
                <TableCell>{app.category?.label ?? "—"}</TableCell>
                <TableCell>{app.subCategory?.label ?? "—"}</TableCell>
                <TableCell>{app.submittedAt ? app.submittedAt.toISOString().slice(0, 10) : "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{STATUS_LABELS[app.status]}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{app.applicationCode}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/applications/${app.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {applications.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No applications in this view.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
