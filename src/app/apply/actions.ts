"use server";

import { auth } from "@/lib/auth/server";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { submitApplication } from "@/lib/services/applications/submit";
import { notifyTeamOfSubmission } from "@/lib/services/email/notify-team";
import { sendApplicationConfirmationEmail } from "@/lib/services/email/notify-applicant";
import { notifyAdmins } from "@/lib/services/notifications/create";
import { applicationSubmitSchema, documentUploadSchema } from "@/lib/validators/application";
import { checkRateLimitDetailed, clientIpFromHeaders } from "@/lib/rate-limit";
import { z } from "zod";

const payloadSchema = applicationSubmitSchema.extend({
  documents: z.array(documentUploadSchema).max(10),
});

type SubmitApplicationResult = { success: true; applicationCode: string } | { error: string };

export async function submitApplicationAction(raw: unknown): Promise<SubmitApplicationResult> {
  // Login is never required to apply — if the browser happens to carry a
  // session (e.g. an existing admin testing the form), attribute the
  // application to that account; otherwise it's submitted anonymously.
  const { data: session } = await auth.getSession();

  // Validate first: a submission rejected for a typo never reaches the
  // database or sends email, so it shouldn't use up one of the applicant's
  // rate-limited attempts — otherwise fixing a few field errors locks them out.
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: [...new Set(parsed.error.issues.map((i) => i.message))].join(". ") };
  }

  // Now that login is never required to apply, this is the main unauthenticated
  // write path in the app — rate-limit per IP so it can't be used to spam
  // fake applications (and the emails/notifications each one triggers).
  // Signed-in admins skip it so the team can test the form repeatedly.
  if (session?.user?.role !== ADMIN_ROLES.ADMIN) {
    const ip = await clientIpFromHeaders();
    const limit = await checkRateLimitDetailed(`apply-submit:${ip}`, 5, 15 * 60 * 1000);
    if (limit === "unavailable") {
      return { error: "We couldn't submit your application right now. Please try again in a few minutes — your progress is saved." };
    }
    if (limit === "limited") {
      return { error: "Too many applications submitted from this network. Please try again in a while." };
    }
  }

  try {
    const { application, categoryLabel, subCategoryLabel } = await submitApplication({
      userId: session?.user?.id ?? null,
      categoryId: parsed.data.categoryId,
      subCategoryId: parsed.data.subCategoryId,
      personal: parsed.data.personal,
      professional: parsed.data.professional,
      documents: parsed.data.documents,
      source: parsed.data.source,
    });

    const isCommunity = parsed.data.source === "COMMUNITY";
    const applicantName = `${parsed.data.personal.firstName} ${parsed.data.personal.lastName}`;

    await Promise.all([
      notifyTeamOfSubmission({
        applicationId: application.id,
        applicationCode: application.applicationCode,
        personal: parsed.data.personal,
        category: categoryLabel,
        subCategory: subCategoryLabel,
        source: parsed.data.source,
      }),
      sendApplicationConfirmationEmail({
        to: parsed.data.personal.email,
        applicationId: application.id,
        applicationCode: application.applicationCode,
        categoryLabel,
        subCategoryLabel,
        personal: parsed.data.personal,
        professional: parsed.data.professional,
        source: parsed.data.source,
      }),
      notifyAdmins({
        type: isCommunity ? "new_community_member" : "new_application",
        title: isCommunity ? "New community application" : "New speaker application",
        message: isCommunity
          ? `${applicantName} applied to join the community (${categoryLabel} / ${subCategoryLabel}).`
          : `${applicantName} applied (${categoryLabel} / ${subCategoryLabel}).`,
        link: `/sbh-1111/applications/${application.id}`,
      }).catch(() => {}),
    ]);

    return { success: true as const, applicationCode: application.applicationCode };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to submit application." };
  }
}
