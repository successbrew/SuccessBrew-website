import { prisma } from "@/lib/prisma";
import { ApplicationStatus, ApplicationSource } from "@prisma/client";

/**
 * Only COMMUNITY-source applications an admin has approved can unlock a paid
 * tier. Application.email is globally unique and a second submission from the
 * same email is rejected outright (see submitApplication), so there is at
 * most one Application row per email — no history/resubmission ambiguity to
 * resolve, a single status check is sufficient.
 */
export async function isApprovedCommunityApplicant(email: string): Promise<boolean> {
  const application = await prisma.application.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!application) return false;
  return application.source === ApplicationSource.COMMUNITY && application.status === ApplicationStatus.APPROVED;
}
