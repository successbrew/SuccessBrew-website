"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { caseStudySchema } from "@/lib/admin/schemas/case-study";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/case-studies", "/", "/case-studies"];

export async function createCaseStudy(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runCreate(prisma.caseStudy, caseStudySchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCaseStudy(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runUpdate(prisma.caseStudy, caseStudySchema, id, formDataToObject(formData), [...REVALIDATE, `/case-studies/${id}`]);
}

export async function deleteCaseStudy(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.caseStudy, id, [...REVALIDATE, `/case-studies/${id}`]);
}
