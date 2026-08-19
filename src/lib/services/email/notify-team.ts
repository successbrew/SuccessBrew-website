import { ADMIN_NOTIFICATION_EMAIL } from "./resend-client";
import { sendEmail } from "./send";
import { escapeHtml, sanitizeForHeader } from "./templates/shell";
import type { PersonalInfo } from "@/lib/types/application";
import type { ApplicationSource } from "@prisma/client";

export async function notifyTeamOfSubmission(params: {
  applicationId: string;
  applicationCode: string;
  personal: PersonalInfo;
  category: string;
  subCategory: string;
  source: ApplicationSource;
}) {
  const firstName = sanitizeForHeader(params.personal.firstName);
  const lastName = sanitizeForHeader(params.personal.lastName);
  const isCommunity = params.source === "COMMUNITY";

  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: isCommunity
      ? `New community member joined: ${firstName} ${lastName} (${params.applicationCode})`
      : `New speaker application: ${firstName} ${lastName} (${params.applicationCode})`,
    template: isCommunity ? "team_new_community_member" : "team_new_application",
    applicationId: params.applicationId,
    html: `
      <h2>${isCommunity ? "New community member joined! 🎉" : "New speaker application submitted"}</h2>
      <p><strong>Application ID:</strong> ${escapeHtml(params.applicationCode)}</p>
      <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(params.personal.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(params.personal.phone)}</p>
      <p><strong>Category:</strong> ${escapeHtml(params.category)} / ${escapeHtml(params.subCategory)}</p>
      <p><strong>Location:</strong> ${escapeHtml(params.personal.city)}, ${escapeHtml(params.personal.country)}</p>
      <p>Review it in the admin panel under Applications.</p>
    `,
  });
}

export async function notifyTeamOfSpeakerCreated(params: { applicationId: string; speakerCode: string; displayName: string }) {
  const displayName = sanitizeForHeader(params.displayName);

  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New speaker created: ${displayName} (${params.speakerCode})`,
    template: "team_speaker_created",
    applicationId: params.applicationId,
    html: `
      <h2>New speaker created</h2>
      <p><strong>Speaker ID:</strong> ${escapeHtml(params.speakerCode)}</p>
      <p><strong>Name:</strong> ${escapeHtml(displayName)}</p>
      <p>Next up: schedule their podcast recording.</p>
    `,
  });
}
