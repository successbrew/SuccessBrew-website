"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { testimonialSchema } from "@/lib/admin/schemas/testimonial";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/testimonials", "/", "/testimonials"];

export async function createTestimonial(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runCreate(prisma.testimonial, testimonialSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateTestimonial(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  return runUpdate(prisma.testimonial, testimonialSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteTestimonial(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.testimonial, id, REVALIDATE);
}
