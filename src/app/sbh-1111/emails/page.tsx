import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
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

export default async function EmailsPage() {
  await verifyAdminSession();

  const logs = await prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Emails</h1>
        <p className="text-muted-foreground">Last 200 transactional emails sent by the platform.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sent</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Application</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {log.createdAt.toISOString().slice(0, 19).replace("T", " ")}
              </TableCell>
              <TableCell>{log.to}</TableCell>
              <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{log.template}</TableCell>
              <TableCell>
                <Badge variant={log.status === "SENT" ? "secondary" : "destructive"}>{log.status}</Badge>
              </TableCell>
              <TableCell>
                {log.applicationId ? (
                  <Link href={`/sbh-1111/applications/${log.applicationId}`} className="text-sm text-primary underline underline-offset-2">
                    View
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No emails sent yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
