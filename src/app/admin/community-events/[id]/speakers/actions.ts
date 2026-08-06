"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { eventSpeakerSchema } from "@/lib/admin/schemas/event-speaker";
import { formDataToObject } from "@/lib/admin/form-data";

function revalidatePaths(eventId: string) {
  return [`/admin/community-events/${eventId}/speakers`];
}

export async function createEventSpeaker(eventId: string, formData: FormData) {
  await verifyAdminSession();
  const raw = { ...formDataToObject(formData), eventId };
  return runCreate(prisma.eventSpeaker, eventSpeakerSchema, raw, revalidatePaths(eventId));
}

export async function updateEventSpeaker(eventId: string, speakerId: string, formData: FormData) {
  await verifyAdminSession();
  const raw = { ...formDataToObject(formData), eventId };
  return runUpdate(prisma.eventSpeaker, eventSpeakerSchema, speakerId, raw, revalidatePaths(eventId));
}

export async function deleteEventSpeaker(eventId: string, formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.eventSpeaker, id, revalidatePaths(eventId));
}
