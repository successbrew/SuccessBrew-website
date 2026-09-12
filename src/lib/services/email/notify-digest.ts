import { sendEmail } from "./send";
import { buildDailyDigestEmail } from "./templates/daily-digest";

export async function sendDailyDigestEmail(params: {
  email: string;
  dateLabel: string;
  topicTitles: string[];
  pdfUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const { subject, html } = buildDailyDigestEmail(params);
  return sendEmail({
    to: params.email,
    subject,
    html,
    template: "daily_digest",
  });
}
