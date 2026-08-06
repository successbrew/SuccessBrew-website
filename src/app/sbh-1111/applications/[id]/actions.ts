"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { transitionStatus } from "@/lib/services/applications/status-transitions";
import { createSpeakerFromApplication } from "@/lib/services/speakers/create-speaker";
import { deleteApplicationPermanently } from "@/lib/services/applications/delete-application";
import { sendSpeakerWelcomeEmail } from "@/lib/services/email/notify-speaker";
import { notifyTeamOfSpeakerCreated } from "@/lib/services/email/notify-team";
import { sendApplicationStatusUpdateEmail } from "@/lib/services/email/notify-applicant";
import { notifyAdmins, notifyApplicant } from "@/lib/services/notifications/create";
import { logAudit } from "@/lib/services/audit/log";
import { STATUS_LABELS } from "@/lib/services/applications/status-transitions";
import { ApplicationStatus } from "@prisma/client";
import type { PersonalInfo } from "@/lib/types/application";

type ActionResult = { success: true } | { error: string };

/** Approve/Reject require the stronger permission; every other move (request
 * info, schedule interview, archive) just needs review access. */
function permissionFor(toStatus: ApplicationStatus) {
  return toStatus === ApplicationStatus.APPROVED || toStatus === ApplicationStatus.REJECTED
    ? PERMISSIONS.APPLICATIONS_APPROVE
    : PERMISSIONS.APPLICATIONS_REVIEW;
}

export async function changeApplicationStatus(
  applicationId: string,
  toStatus: ApplicationStatus,
  note: string
): Promise<ActionResult> {
  const admin = await requirePermission(permissionFor(toStatus));

  try {
    const updated = await transitionStatus(applicationId, toStatus, admin.id, note.trim() || undefined);

    const personal = updated.personal as unknown as PersonalInfo;
    await Promise.all([
      sendApplicationStatusUpdateEmail({
        to: personal.email,
        applicationId,
        status: toStatus,
        firstName: personal.firstName,
        applicationCode: updated.applicationCode,
        note: note.trim() || undefined,
      }),
      // In-app notifications only apply to applicants who happen to have an
      // account — anonymous applicants (the common case) rely on email alone.
      updated.userId
        ? notifyApplicant({
            recipientId: updated.userId,
            type: `status_${toStatus.toLowerCase()}`,
            title: STATUS_LABELS[toStatus],
            message: note.trim() || `Your application ${updated.applicationCode} is now ${STATUS_LABELS[toStatus]}.`,
            link: "/apply",
          }).catch(() => {})
        : Promise.resolve(),
    ]);

    if (toStatus === ApplicationStatus.APPROVED || toStatus === ApplicationStatus.REJECTED) {
      await logAudit({
        actorId: admin.id,
        action: toStatus === ApplicationStatus.APPROVED ? "application_approved" : "application_rejected",
        targetType: "Application",
        targetId: applicationId,
        metadata: note.trim() ? { note: note.trim() } : undefined,
      }).catch(() => {});
    }

    revalidatePath(`/sbh-1111/applications/${applicationId}`);
    revalidatePath("/sbh-1111/applications");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update status." };
  }
}

export async function addApplicationReview(applicationId: string, formData: FormData): Promise<ActionResult> {
  const admin = await requirePermission(PERMISSIONS.APPLICATIONS_REVIEW);

  const scoreRaw = String(formData.get("score") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!notes && !scoreRaw) return { error: "Add a score or a note." };

  await prisma.review.create({
    data: {
      applicationId,
      reviewerId: admin.id,
      score: scoreRaw ? Number(scoreRaw) : null,
      notes: notes || null,
    },
  });

  revalidatePath(`/sbh-1111/applications/${applicationId}`);
  return { success: true };
}

/** Approve -> Create Speaker -> assign ID -> welcome email -> notify team, all atomically. */
export async function createSpeakerAction(applicationId: string): Promise<ActionResult> {
  const admin = await requirePermission(PERMISSIONS.APPLICATIONS_APPROVE);

  try {
    const { speaker, personal } = await createSpeakerFromApplication(applicationId, admin.id);

    await Promise.all([
      sendSpeakerWelcomeEmail({
        to: personal.email,
        applicationId,
        firstName: personal.firstName,
        speakerCode: speaker.speakerCode,
      }),
      notifyTeamOfSpeakerCreated({ applicationId, speakerCode: speaker.speakerCode, displayName: speaker.displayName }),
      notifyAdmins({
        type: "speaker_created",
        title: "New speaker created",
        message: `${speaker.displayName} (${speaker.speakerCode}) is now a speaker.`,
        link: `/sbh-1111/applications/${applicationId}`,
      }).catch(() => {}),
      speaker.userId
        ? notifyApplicant({
            recipientId: speaker.userId,
            type: "speaker_created",
            title: "You're a Successbrew speaker!",
            message: `Your speaker ID is ${speaker.speakerCode}. Welcome aboard.`,
            link: "/community",
          }).catch(() => {})
        : Promise.resolve(),
    ]);

    await logAudit({
      actorId: admin.id,
      action: "speaker_created",
      targetType: "Speaker",
      targetId: speaker.id,
      metadata: { speakerCode: speaker.speakerCode, applicationId },
    }).catch(() => {});

    revalidatePath(`/sbh-1111/applications/${applicationId}`);
    revalidatePath("/sbh-1111/applications");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create speaker." };
  }
}

/**
 * Permanent, irreversible deletion — gated behind the 3-step confirmation UI
 * (see DeleteApplicationDialog). Only Admin/Super Admin can call this.
 */
export async function deleteApplicationAction(applicationId: string): Promise<ActionResult> {
  const admin = await requirePermission(PERMISSIONS.APPLICATIONS_APPROVE);

  try {
    await deleteApplicationPermanently(applicationId, admin.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete application." };
  }

  revalidatePath("/sbh-1111/applications");
  redirect("/sbh-1111/applications");
}
