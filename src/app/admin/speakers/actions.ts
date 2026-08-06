"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { speakerProfileSchema } from "@/lib/admin/schemas/speaker";
import { formDataToObject } from "@/lib/admin/form-data";

type ActionResult = { success: true } | { error: string };

export async function updateSpeakerProfile(speakerId: string, formData: FormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.SPEAKERS_MANAGE);

  const parsed = speakerProfileSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await prisma.speaker.update({ where: { id: speakerId }, data: parsed.data });

  revalidatePath(`/admin/speakers/${speakerId}`);
  revalidatePath("/admin/speakers");
  return { success: true };
}

export async function addSpeakerNote(speakerId: string, formData: FormData): Promise<ActionResult> {
  const admin = await requirePermission(PERMISSIONS.SPEAKERS_MANAGE);

  const note = String(formData.get("note") ?? "").trim();
  if (!note) return { error: "Note can't be empty." };

  await prisma.speakerNote.create({ data: { speakerId, authorId: admin.id, note } });

  revalidatePath(`/admin/speakers/${speakerId}`);
  return { success: true };
}
