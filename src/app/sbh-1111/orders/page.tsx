import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<OrderStatus, string> = {
  INITIATED: "Initiated",
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

const FILTER_STATUSES = Object.values(OrderStatus);

function formatInr(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  const { status } = await searchParams;
  const activeStatus = status && FILTER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  const [orders, counts, revenue] = await Promise.all([
    prisma.order.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
  ]);
  const countByStatus = new Map(counts.map((c) => [c.status, c._count]));
  const totalCount = counts.reduce((sum, c) => sum + c._count, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-muted-foreground">
            {orders.length} of {totalCount} order{totalCount !== 1 ? "s" : ""} {activeStatus ? "in this view" : "total"} · {formatInr(revenue._sum.amount ?? 0)} collected
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/sbh-1111/orders">
          <Badge variant={!activeStatus ? "default" : "secondary"} className="cursor-pointer">
            All ({totalCount})
          </Badge>
        </Link>
        {FILTER_STATUSES.map((s) => {
          const count = countByStatus.get(s) ?? 0;
          if (count === 0) return null;
          return (
            <Link key={s} href={`/sbh-1111/orders?status=${s}`}>
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
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.customerEmail}</TableCell>
              <TableCell>{formatInr(order.amount)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{STATUS_LABELS[order.status]}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{order.provider}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {order.createdAt.toISOString().slice(0, 10)}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/sbh-1111/orders/${order.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No orders in this view.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
