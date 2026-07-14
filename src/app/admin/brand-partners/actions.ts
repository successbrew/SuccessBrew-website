"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { brandPartnerSchema } from "@/lib/admin/schemas/brand-partner";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/admin/brand-partners", "/"];

export async function createBrandPartner(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.brandPartner, brandPartnerSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateBrandPartner(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.brandPartner, brandPartnerSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteBrandPartner(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.brandPartner, id, REVALIDATE);
}
