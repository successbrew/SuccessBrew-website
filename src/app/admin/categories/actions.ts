"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { subCategorySchema } from "@/lib/admin/schemas/sub-category";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/admin/categories", "/apply"];

export async function createSubCategory(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.subCategory, subCategorySchema, formDataToObject(formData), REVALIDATE);
}

export async function updateSubCategory(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.subCategory, subCategorySchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteSubCategory(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.subCategory, id, REVALIDATE);
}
