"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { statSchema } from "@/lib/admin/schemas/stat";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/stats", "/"];

export async function createStat(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.stat, statSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateStat(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.stat, statSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteStat(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.stat, id, REVALIDATE);
}
