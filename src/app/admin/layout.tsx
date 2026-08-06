import Link from "next/link";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { CONTENT_TYPE_NAV_GROUPS } from "@/lib/admin/content-types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { prisma } from "@/lib/prisma";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await verifyAdminSession();
  const isSuperAdmin = admin.roles.includes("SUPER_ADMIN");

  const notifications = await prisma.notification.findMany({
    where: { audience: "ADMIN" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex min-h-screen bg-sand">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-background p-4">
        <div className="mb-6 px-2">
          <p className="font-display text-lg font-semibold">Successbrew Admin</p>
          <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {admin.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {ROLE_LABELS[role]}
              </Badge>
            ))}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {CONTENT_TYPE_NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <Separator className="my-2" />
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}

          {isSuperAdmin && (
            <>
              <Separator className="my-2" />
              <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
                Admin
              </p>
              <Link
                href="/admin/users"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                <Users className="h-4 w-4" />
                Manage Admins
              </Link>
            </>
          )}
        </nav>

        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-border bg-background px-6">
          <NotificationBell notifications={notifications} />
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
