import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/services/audit/log";

/**
 * Permanently and irreversibly erases an application and everything attached
 * to it (documents, review notes, activity log, status history). Unlike every
 * other mutation in this app, this does NOT go through transitionStatus() —
 * there's no "deleted" status; the row stops existing.
 *
 * Blocked while a Speaker record still points at this application — deleting
 * out from under a live public profile would either orphan it or silently
 * cascade into deleting someone's public page as a side effect, neither of
 * which an admin clicking "delete this application" is asking for.
 */
export async function deleteApplicationPermanently(applicationId: string, actorId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { speaker: true },
  });

  if (!application) {
    throw new Error("Application not found.");
  }
  if (application.speaker) {
    throw new Error(
      "This applicant has a public Speaker profile — remove or unpublish it at /admin/speakers before deleting the application."
    );
  }

  await prisma.$transaction([
    prisma.document.deleteMany({ where: { applicationId } }),
    prisma.review.deleteMany({ where: { applicationId } }),
    prisma.activityLog.deleteMany({ where: { applicationId } }),
    prisma.statusHistory.deleteMany({ where: { applicationId } }),
    prisma.application.delete({ where: { id: applicationId } }),
  ]);

  await logAudit({
    actorId,
    action: "application_deleted",
    targetType: "Application",
    targetId: applicationId,
    metadata: { applicationCode: application.applicationCode },
  }).catch(() => {});
}
