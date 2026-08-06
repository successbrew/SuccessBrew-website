"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { caseStudySchema } from "@/lib/admin/schemas/case-study";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/case-studies", "/"];

export async function createCaseStudy(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.caseStudy, caseStudySchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCaseStudy(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.caseStudy, caseStudySchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteCaseStudy(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.caseStudy, id, REVALIDATE);
}
