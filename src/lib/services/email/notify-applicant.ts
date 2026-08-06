import { sendEmail } from "./send";
import { buildApplicationReceivedEmail } from "./templates/application-received";
import { buildStatusUpdateEmail } from "./templates/status-update";
import type { ApplicationStatus } from "@prisma/client";
import type { PersonalInfo, ProfessionalInfo } from "@/lib/types/application";

export async function sendApplicationConfirmationEmail(params: {
  to: string;
  applicationId: string;
  applicationCode: string;
  categoryLabel: string;
  subCategoryLabel: string;
  personal: PersonalInfo;
  professional: ProfessionalInfo;
}) {
  const { subject, html } = buildApplicationReceivedEmail(params);
  await sendEmail({
    to: params.to,
    subject,
    html,
    template: "applicant_application_received",
    applicationId: params.applicationId,
  });
}

/** No-op for statuses that don't have applicant-facing copy (see status-update.ts). */
export async function sendApplicationStatusUpdateEmail(params: {
  to: string;
  applicationId: string;
  status: ApplicationStatus;
  firstName: string;
  applicationCode: string;
  note?: string;
}) {
  const built = buildStatusUpdateEmail(params);
  if (!built) return;

  await sendEmail({
    to: params.to,
    subject: built.subject,
    html: built.html,
    template: `applicant_status_${params.status.toLowerCase()}`,
    applicationId: params.applicationId,
  });
}
