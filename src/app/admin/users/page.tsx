import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { UsersTable } from "./users-table";
import { InviteAdminDialog } from "./invite-dialog";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentAdmin = await requireSuperAdmin();

  const { data, error } = await auth.admin.listUsers({
    query: { limit: 200, offset: 0 },
  });

  if (error) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-semibold">Manage Admins</h1>
        <p className="text-destructive">Failed to load users: {error.message}</p>
      </div>
    );
  }

  const adminAccounts = (data?.users ?? []).filter((u) => u.role === ADMIN_ROLES.ADMIN);
  const profiles = await prisma.adminProfile.findMany({
    where: { id: { in: adminAccounts.map((u) => u.id) } },
  });
  const rolesById = new Map(profiles.map((p) => [p.id, p.roles]));

  const admins = adminAccounts
    .filter((u) => rolesById.has(u.id))
    .map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      roles: rolesById.get(u.id)!,
    }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manage Admins</h1>
          <p className="text-muted-foreground">
            Invite new admins and manage Super Admin / Editor roles.
          </p>
        </div>
        <InviteAdminDialog />
      </div>

      <UsersTable admins={admins} currentAdminId={currentAdmin.id} />
    </div>
  );
}
