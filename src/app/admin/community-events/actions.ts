"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { communityEventSchema } from "@/lib/admin/schemas/community-event";
import { formDataToObject } from "@/lib/admin/form-data";
import { EVENT_PILLARS } from "@/lib/event-pillars";

const REVALIDATE = [
  "/admin/community-events",
  "/community",
  "/community/events",
  ...EVENT_PILLARS.map((p) => `/community/events/${p.slug}`),
];

export async function createCommunityEvent(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.communityEvent, communityEventSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCommunityEvent(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.communityEvent, communityEventSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteCommunityEvent(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.communityEvent, id, REVALIDATE);
}
