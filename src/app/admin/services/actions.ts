"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { serviceSchema } from "@/lib/admin/schemas/service";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/admin/services", "/"];

export async function createService(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.service, serviceSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateService(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.service, serviceSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteService(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.service, id, REVALIDATE);
}
