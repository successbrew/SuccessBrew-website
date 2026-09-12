"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { processStepSchema } from "@/lib/admin/schemas/process-step";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/process-steps", "/"];

export async function createProcessStep(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runCreate(prisma.processStep, processStepSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateProcessStep(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runUpdate(prisma.processStep, processStepSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteProcessStep(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.processStep, id, REVALIDATE);
}
