"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { brandPartnerSchema } from "@/lib/admin/schemas/brand-partner";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/brand-partners", "/"];

export async function createBrandPartner(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runCreate(prisma.brandPartner, brandPartnerSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateBrandPartner(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runUpdate(prisma.brandPartner, brandPartnerSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteBrandPartner(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.brandPartner, id, REVALIDATE);
}
