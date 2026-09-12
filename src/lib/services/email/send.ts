import { resend, EMAIL_FROM, REPLY_TO_EMAIL } from "./resend-client";
import { prisma } from "@/lib/prisma";

/**
 * Every transactional email in the app goes through here — it's the one place
 * that both calls Resend and writes the EmailLog row, so a send never
 * succeeds/fails silently on one side but not the other. Never throws: a
 * flaky email provider should never block the database write that already
 * succeeded. Returns `{ success }` so callers that need to know whether the
 * email actually went out (e.g. the digest pipeline's SENT/FAILED status —
 * see H9) can check it instead of assuming a resolved promise means success.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  template: string;
  applicationId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // The Resend SDK resolves with `{ data, error }` on both success and
    // failure — it does not throw for a provider-reported send error (bad
    // recipient, unverified domain, rate limit, ...), so that has to be
    // checked explicitly rather than assumed from the promise resolving.
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: REPLY_TO_EMAIL,
    });

    if (error) {
      const message = typeof error === "object" && error && "message" in error ? String(error.message) : String(error);
      console.error(`Resend reported a send error (${params.template}) to ${params.to}:`, message);
      await prisma.emailLog
        .create({
          data: { to: params.to, subject: params.subject, template: params.template, status: "FAILED", error: message, applicationId: params.applicationId },
        })
        .catch(() => {});
      return { success: false, error: message };
    }

    await prisma.emailLog
      .create({
        data: {
          to: params.to,
          subject: params.subject,
          template: params.template,
          status: "SENT",
          applicationId: params.applicationId,
        },
      })
      .catch(() => {});
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to send email (${params.template}) to ${params.to}:`, error);
    await prisma.emailLog
      .create({
        data: {
          to: params.to,
          subject: params.subject,
          template: params.template,
          status: "FAILED",
          error: message,
          applicationId: params.applicationId,
        },
      })
      .catch(() => {});
    return { success: false, error: message };
  }
}
