import { sendEmail } from "./send";
import { buildCommunityApprovedEmail } from "./templates/community-approved";

export async function sendCommunityApprovedEmail(params: {
  to: string;
  applicationId: string;
  firstName: string;
}) {
  const { subject, html } = buildCommunityApprovedEmail(params);
  await sendEmail({
    to: params.to,
    subject,
    html,
    template: "community_approved",
    applicationId: params.applicationId,
  });
}
