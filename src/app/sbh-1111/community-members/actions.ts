"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { brandPartnerSchema } from "@/lib/admin/schemas/brand-partner";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/community-members", "/community"];

export async function createCommunityMember(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.brandPartner, brandPartnerSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCommunityMember(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.brandPartner, brandPartnerSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteCommunityMember(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.brandPartner, id, REVALIDATE);
}
