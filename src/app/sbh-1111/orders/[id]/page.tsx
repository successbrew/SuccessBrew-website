import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

function formatInr(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" } },
      lead: true,
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order</h1>
          <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/sbh-1111/orders">← Back to orders</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><span className="text-muted-foreground">Customer:</span> {order.customerEmail}</div>
          <div><span className="text-muted-foreground">Status:</span> <Badge variant="secondary">{order.status}</Badge></div>
          <div><span className="text-muted-foreground">Amount:</span> {formatInr(order.amount)} {order.currency}</div>
          <div><span className="text-muted-foreground">Provider:</span> {order.provider}</div>
          <div><span className="text-muted-foreground">Provider order id:</span> {order.providerOrderId ?? "—"}</div>
          <div><span className="text-muted-foreground">Lead:</span> {order.lead ? `${order.lead.status} (${order.lead.email})` : "—"}</div>
          <div><span className="text-muted-foreground">Paid at:</span> {order.paidAt?.toISOString() ?? "—"}</div>
          <div><span className="text-muted-foreground">Refunded at:</span> {order.refundedAt?.toISOString() ?? "—"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider payment id</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.providerPaymentId}</TableCell>
                  <TableCell>{formatInr(p.amount)}</TableCell>
                  <TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.verifiedAt?.toISOString() ?? "—"}</TableCell>
                </TableRow>
              ))}
              {order.payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No payments recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.eventType}</TableCell>
                  <TableCell><Badge variant="secondary">{e.status}</Badge></TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-destructive">{e.lastError ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.createdAt.toISOString()}</TableCell>
                </TableRow>
              ))}
              {order.events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No webhook events recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
