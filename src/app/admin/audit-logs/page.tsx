import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/server";
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

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  admin_invited: "Admin invited",
  admin_roles_updated: "Admin roles updated",
  admin_removed: "Admin removed",
  application_approved: "Application approved",
  application_rejected: "Application rejected",
  speaker_created: "Speaker created",
};

export default async function AuditLogsPage() {
  await requirePermission(PERMISSIONS.AUDIT_VIEW);

  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  const { data } = await auth.admin.listUsers({ query: { limit: 200, offset: 0 } }).catch(() => ({ data: null }));
  const emailById = new Map((data?.users ?? []).map((u) => [u.id, u.email]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-muted-foreground">Last 200 security-relevant actions — admin management, approvals, rejections.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {log.createdAt.toISOString().slice(0, 19).replace("T", " ")}
              </TableCell>
              <TableCell className="text-sm">{emailById.get(log.actorId) ?? log.actorId}</TableCell>
              <TableCell>
                <Badge variant="secondary">{ACTION_LABELS[log.action] ?? log.action}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {log.targetType}{log.targetId ? ` · ${log.targetId}` : ""}
              </TableCell>
              <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                {log.metadata ? JSON.stringify(log.metadata) : "—"}
              </TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No audit events yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
