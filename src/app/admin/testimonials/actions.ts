"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { testimonialSchema } from "@/lib/admin/schemas/testimonial";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/admin/testimonials", "/"];

export async function createTestimonial(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.testimonial, testimonialSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateTestimonial(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.testimonial, testimonialSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteTestimonial(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.testimonial, id, REVALIDATE);
}
