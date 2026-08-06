"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { communityWinSchema } from "@/lib/admin/schemas/community-win";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/community-wins", "/community"];

export async function createCommunityWin(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.communityWin, communityWinSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCommunityWin(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.communityWin, communityWinSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteCommunityWin(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.communityWin, id, REVALIDATE);
}
