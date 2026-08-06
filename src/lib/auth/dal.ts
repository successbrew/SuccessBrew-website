import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { hasPermission, type Permission } from "@/lib/auth/permissions";

/**
 * Authoritative session + role check for every admin route/server action.
 * proxy.ts only does an optimistic cookie-presence check — this is the real gate.
 *
 * Neon Auth's hosted role field is binary ("user" | "admin"); our own granular
 * role set (SUPER_ADMIN, REVIEWER, COMMUNITY_MANAGER, ...) lives in the
 * AdminProfile Prisma table, keyed by the Neon Auth user id.
 */
export const verifyAdminSession = cache(async () => {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  if (session.user.role !== ADMIN_ROLES.ADMIN) {
    redirect("/admin/no-access");
  }

  const profile = await prisma.adminProfile.findUnique({
    where: { id: session.user.id },
  });

  if (!profile) {
    redirect("/admin/no-access");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name as string | null,
    roles: profile.roles,
  };
});

export async function requireSuperAdmin() {
  const admin = await verifyAdminSession();
  if (!admin.roles.includes("SUPER_ADMIN")) {
    redirect("/admin");
  }
  return admin;
}

export async function requirePermission(permission: Permission) {
  const admin = await verifyAdminSession();
  if (!hasPermission(admin.roles, permission)) {
    redirect("/admin/no-access");
  }
  return admin;
}
