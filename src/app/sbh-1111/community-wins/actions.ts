"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { communityWinSchema } from "@/lib/admin/schemas/community-win";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/community-wins", "/community"];

export async function createCommunityWin(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  return runCreate(prisma.communityWin, communityWinSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCommunityWin(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  return runUpdate(prisma.communityWin, communityWinSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteCommunityWin(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.communityWin, id, REVALIDATE);
}
