"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { brandPartnerSchema } from "@/lib/admin/schemas/brand-partner";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/community-partners", "/community"];

export async function createCommunityPartner(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  return runCreate(prisma.brandPartner, brandPartnerSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCommunityPartner(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  return runUpdate(prisma.brandPartner, brandPartnerSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteCommunityPartner(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.brandPartner, id, REVALIDATE);
}
