"use server";

import { auth } from "@/lib/auth/server";
import { submitApplication } from "@/lib/services/applications/submit";
import { notifyTeamOfSubmission } from "@/lib/services/email/notify-team";
import { sendApplicationConfirmationEmail } from "@/lib/services/email/notify-applicant";
import { notifyAdmins } from "@/lib/services/notifications/create";
import { applicationSubmitSchema, documentUploadSchema } from "@/lib/validators/application";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { z } from "zod";

const payloadSchema = applicationSubmitSchema.extend({
  documents: z.array(documentUploadSchema).max(10),
});

type SubmitApplicationResult = { success: true; applicationCode: string } | { error: string };

export async function submitApplicationAction(raw: unknown): Promise<SubmitApplicationResult> {
  // Now that login is never required to apply, this is the main unauthenticated
  // write path in the app — rate-limit per IP so it can't be used to spam
  // fake applications (and the emails/notifications each one triggers).
  const ip = await clientIpFromHeaders();
  if (!checkRateLimit(`apply-submit:${ip}`, 5, 15 * 60 * 1000)) {
    return { error: "Too many applications submitted from this network. Please try again in a while." };
  }

  // Login is never required to apply — if the browser happens to carry a
  // session (e.g. an existing admin testing the form), attribute the
  // application to that account; otherwise it's submitted anonymously.
  const { data: session } = await auth.getSession();

  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    const { application, categoryLabel, subCategoryLabel } = await submitApplication({
      userId: session?.user?.id ?? null,
      categoryId: parsed.data.categoryId,
      subCategoryId: parsed.data.subCategoryId,
      personal: parsed.data.personal,
      professional: parsed.data.professional,
      documents: parsed.data.documents,
    });

    await Promise.all([
      notifyTeamOfSubmission({
        applicationId: application.id,
        applicationCode: application.applicationCode,
        personal: parsed.data.personal,
        category: categoryLabel,
        subCategory: subCategoryLabel,
      }),
      sendApplicationConfirmationEmail({
        to: parsed.data.personal.email,
        applicationId: application.id,
        applicationCode: application.applicationCode,
        categoryLabel,
        subCategoryLabel,
        personal: parsed.data.personal,
        professional: parsed.data.professional,
      }),
      notifyAdmins({
        type: "new_application",
        title: "New speaker application",
        message: `${parsed.data.personal.firstName} ${parsed.data.personal.lastName} applied (${categoryLabel} / ${subCategoryLabel}).`,
        link: `/sbh-1111/applications/${application.id}`,
      }).catch(() => {}),
    ]);

    return { success: true as const, applicationCode: application.applicationCode };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to submit application." };
  }
}
