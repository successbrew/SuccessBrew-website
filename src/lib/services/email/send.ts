import { resend, EMAIL_FROM, REPLY_TO_EMAIL } from "./resend-client";
import { prisma } from "@/lib/prisma";

/**
 * Every transactional email in the app goes through here — it's the one place
 * that both calls Resend and writes the EmailLog row, so a send never
 * succeeds/fails silently on one side but not the other. Never throws: a
 * flaky email provider should never block the database write that already
 * succeeded.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  template: string;
  applicationId?: string;
}) {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: REPLY_TO_EMAIL,
    });
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
  } catch (error) {
    console.error(`Failed to send email (${params.template}) to ${params.to}:`, error);
    await prisma.emailLog
      .create({
        data: {
          to: params.to,
          subject: params.subject,
          template: params.template,
          status: "FAILED",
          error: error instanceof Error ? error.message : String(error),
          applicationId: params.applicationId,
        },
      })
      .catch(() => {});
  }
}
