"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";

export async function updateEventPartners(eventId: string, formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  const partnerIds = formData.getAll("partnerIds").map(String);

  await prisma.communityEvent.update({
    where: { id: eventId },
    data: { partners: { set: partnerIds.map((id) => ({ id })) } },
  });

  revalidatePath(`/sbh-1111/community-events/${eventId}/edit`);
  return { success: true as const };
}
