"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { subCategorySchema } from "@/lib/admin/schemas/sub-category";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/categories", "/apply"];

export async function createSubCategory(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runCreate(prisma.subCategory, subCategorySchema, formDataToObject(formData), REVALIDATE);
}

export async function updateSubCategory(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runUpdate(prisma.subCategory, subCategorySchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteSubCategory(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.subCategory, id, REVALIDATE);
}
