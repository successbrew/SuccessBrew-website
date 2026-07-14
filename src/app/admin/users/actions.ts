"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AdminTier } from "@prisma/client";

function randomTempPassword() {
  return crypto.randomUUID() + crypto.randomUUID();
}

export async function inviteAdmin(formData: FormData) {
  await requireSuperAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const tier = String(formData.get("role") ?? "") as AdminTier;

  if (!email || !name) return { error: "Name and email are required." };
  if (tier !== AdminTier.SUPER_ADMIN && tier !== AdminTier.EDITOR) {
    return { error: "Invalid role." };
  }

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
    data: { id: created.user.id, tier },
  });

  // Let the invitee set their own password via the standard reset-password email flow.
  await auth.requestPasswordReset({ email, redirectTo: "/auth/reset-password" }).catch(() => {});

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateAdminTier(formData: FormData) {
  const admin = await requireSuperAdmin();

  const userId = String(formData.get("userId") ?? "");
  const tier = String(formData.get("tier") ?? "") as AdminTier;

  if (userId === admin.id) {
    return { error: "You can't change your own role." };
  }
  if (tier !== AdminTier.SUPER_ADMIN && tier !== AdminTier.EDITOR) {
    return { error: "Invalid role." };
  }

  await prisma.adminProfile.update({ where: { id: userId }, data: { tier } });

  revalidatePath("/admin/users");
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

  revalidatePath("/admin/users");
  return { success: true };
}
