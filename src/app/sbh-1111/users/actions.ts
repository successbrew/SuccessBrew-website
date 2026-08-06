"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { logAudit } from "@/lib/services/audit/log";
import { AdminRole } from "@prisma/client";

function randomTempPassword() {
  return crypto.randomUUID() + crypto.randomUUID();
}

function parseRoles(formData: FormData): AdminRole[] | null {
  const values = formData.getAll("roles").map(String);
  const validValues = new Set<string>(Object.values(AdminRole));
  if (values.length === 0 || !values.every((v) => validValues.has(v))) return null;
  return values as AdminRole[];
}

export async function inviteAdmin(formData: FormData) {
  const admin = await requireSuperAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const roles = parseRoles(formData);

  if (!email || !name) return { error: "Name and email are required." };
  if (!roles) return { error: "Select at least one valid role." };

  const { data: created, error: createError } = await auth.admin.createUser({
    email,
    password: randomTempPassword(),
    name,
    role: ADMIN_ROLES.ADMIN,
  });

  if (createError || !created?.user) {
    return { error: createError?.message ?? "Failed to create the admin account." };
  }

  await prisma.adminProfile.create({
    data: { id: created.user.id, roles },
  });

  // Let the invitee set their own password via the standard reset-password email flow.
  await auth.requestPasswordReset({ email, redirectTo: "/auth/reset-password" }).catch(() => {});

  await logAudit({
    actorId: admin.id,
    action: "admin_invited",
    targetType: "AdminProfile",
    targetId: created.user.id,
    metadata: { email, roles },
  }).catch(() => {});

  revalidatePath("/sbh-1111/users");
  return { success: true };
}

export async function updateAdminRoles(formData: FormData) {
  const admin = await requireSuperAdmin();

  const userId = String(formData.get("userId") ?? "");
  const roles = parseRoles(formData);

  if (userId === admin.id) {
    return { error: "You can't change your own role." };
  }
  if (!roles) return { error: "Select at least one valid role." };

  await prisma.adminProfile.update({ where: { id: userId }, data: { roles } });

  await logAudit({
    actorId: admin.id,
    action: "admin_roles_updated",
    targetType: "AdminProfile",
    targetId: userId,
    metadata: { roles },
  }).catch(() => {});

  revalidatePath("/sbh-1111/users");
  return { success: true };
}

export async function removeAdmin(formData: FormData) {
  const admin = await requireSuperAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (userId === admin.id) {
    return { error: "You can't remove your own account." };
  }

  const { error } = await auth.admin.removeUser({ userId });
  if (error) return { error: error.message ?? "Failed to remove admin." };

  await prisma.adminProfile.delete({ where: { id: userId } }).catch(() => {});

  await logAudit({
    actorId: admin.id,
    action: "admin_removed",
    targetType: "AdminProfile",
    targetId: userId,
  }).catch(() => {});

  revalidatePath("/sbh-1111/users");
  return { success: true };
}
