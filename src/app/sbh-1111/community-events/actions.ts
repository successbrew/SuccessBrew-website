"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { communityEventSchema } from "@/lib/admin/schemas/community-event";
import { formDataToObject } from "@/lib/admin/form-data";
import { EVENT_PILLARS } from "@/lib/event-pillars";

const REVALIDATE = [
  "/sbh-1111/community-events",
  "/community",
  "/community/events",
  ...EVENT_PILLARS.map((p) => `/community/events/${p.slug}`),
];

export async function createCommunityEvent(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  return runCreate(prisma.communityEvent, communityEventSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCommunityEvent(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  return runUpdate(prisma.communityEvent, communityEventSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteCommunityEvent(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.communityEvent, id, REVALIDATE);
}
