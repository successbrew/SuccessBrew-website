import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

/**
 * The only place that decides which status moves are legal. Every admin action
 * (approve/reject/request-info/schedule/archive/...) and every later-module
 * automation must go through transitionStatus() below rather than calling
 * `prisma.application.update({ data: { status } })` directly, or the
 * StatusHistory/ActivityLog trail silently falls out of sync with reality.
 */
const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: [ApplicationStatus.SUBMITTED],
  SUBMITTED: [ApplicationStatus.UNDER_REVIEW],
  UNDER_REVIEW: [
    ApplicationStatus.NEED_MORE_INFO,
    ApplicationStatus.INTERVIEW_SCHEDULED,
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.ARCHIVED,
  ],
  NEED_MORE_INFO: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.ARCHIVED],
  INTERVIEW_SCHEDULED: [
    ApplicationStatus.INTERVIEW_COMPLETED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.ARCHIVED,
  ],
  INTERVIEW_COMPLETED: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.ARCHIVED],
  APPROVED: [ApplicationStatus.SPEAKER_CREATED],
  REJECTED: [ApplicationStatus.ARCHIVED],
  SPEAKER_CREATED: [ApplicationStatus.PODCAST_SCHEDULED],
  PODCAST_SCHEDULED: [ApplicationStatus.RECORDING_COMPLETED],
  RECORDING_COMPLETED: [ApplicationStatus.EDITING],
  EDITING: [ApplicationStatus.PUBLISHED],
  PUBLISHED: [],
  ARCHIVED: [ApplicationStatus.UNDER_REVIEW],
};

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function legalNextStatuses(from: ApplicationStatus): ApplicationStatus[] {
  return ALLOWED_TRANSITIONS[from];
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  NEED_MORE_INFO: "Need More Info",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  INTERVIEW_COMPLETED: "Interview Completed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SPEAKER_CREATED: "Speaker Created",
  PODCAST_SCHEDULED: "Podcast Scheduled",
  RECORDING_COMPLETED: "Recording Completed",
  EDITING: "Editing",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

/**
 * Atomically moves an application to a new status, and records both the
 * StatusHistory row (the audit trail the "never delete, only update status"
 * requirement depends on) and an ActivityLog entry for the applicant-facing
 * timeline. Throws if the transition isn't legal from the application's
 * current status.
 */
export async function transitionStatus(
  applicationId: string,
  toStatus: ApplicationStatus,
  actorId: string,
  note?: string
) {
  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findUniqueOrThrow({ where: { id: applicationId } });

    if (!canTransition(application.status, toStatus)) {
      throw new Error(`Cannot transition application from ${application.status} to ${toStatus}.`);
    }

    const updated = await tx.application.update({
      where: { id: applicationId },
      data: { status: toStatus },
    });

    await tx.statusHistory.create({
      data: { applicationId, fromStatus: application.status, toStatus, changedBy: actorId, note },
    });

    await tx.activityLog.create({
      data: {
        applicationId,
        actorId,
        action: `status_changed:${application.status}->${toStatus}`,
        metadata: (note ? { note } : undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    return updated;
  });
}
