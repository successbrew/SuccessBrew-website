"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { processStepSchema } from "@/lib/admin/schemas/process-step";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/process-steps", "/"];

export async function createProcessStep(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.processStep, processStepSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateProcessStep(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.processStep, processStepSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteProcessStep(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.processStep, id, REVALIDATE);
}
