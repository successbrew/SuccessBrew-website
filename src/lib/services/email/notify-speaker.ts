import { sendEmail } from "./send";
import { buildSpeakerWelcomeEmail } from "./templates/speaker-welcome";

export async function sendSpeakerWelcomeEmail(params: {
  to: string;
  applicationId: string;
  firstName: string;
  speakerCode: string;
}) {
  const { subject, html } = buildSpeakerWelcomeEmail(params);
  await sendEmail({
    to: params.to,
    subject,
    html,
    template: "speaker_welcome",
    applicationId: params.applicationId,
  });
}
