import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<LeadStatus, string> = {
  LEAD: "Lead",
  ENGAGED: "Engaged",
  CHECKOUT_STARTED: "Checkout started",
  PAID: "Paid",
  REFUNDED: "Refunded",
  UNSUBSCRIBED: "Unsubscribed",
};

const FILTER_STATUSES = Object.values(LeadStatus);

export default async function LeadsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  const { status } = await searchParams;
  const activeStatus = status && FILTER_STATUSES.includes(status as LeadStatus) ? (status as LeadStatus) : undefined;

  const [leads, counts] = await Promise.all([
    prisma.lead.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { brevoSync: true },
    }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  const countByStatus = new Map(counts.map((c) => [c.status, c._count]));
  const totalCount = counts.reduce((sum, c) => sum + c._count, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-muted-foreground">
          {leads.length} of {totalCount} lead{totalCount !== 1 ? "s" : ""} {activeStatus ? "in this view" : "total"} (showing latest 200).
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/sbh-1111/leads">
          <Badge variant={!activeStatus ? "default" : "secondary"} className="cursor-pointer">
            All ({totalCount})
          </Badge>
        </Link>
        {FILTER_STATUSES.map((s) => {
          const count = countByStatus.get(s) ?? 0;
          if (count === 0) return null;
          return (
            <Link key={s} href={`/sbh-1111/leads?status=${s}`}>
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
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Brevo sync</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="secondary">{STATUS_LABELS[lead.status]}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{lead.source}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {lead.brevoSync?.syncStatus ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {lead.createdAt.toISOString().slice(0, 10)}
              </TableCell>
            </TableRow>
          ))}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No leads in this view.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
