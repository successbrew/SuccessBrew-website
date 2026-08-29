import { renderEmailShell, eyebrow, heading, paragraph, ctaButton, escapeHtml } from "./shell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

export function buildDailyDigestEmail(params: { email: string; dateLabel: string; topicTitles: string[]; pdfUrl: string }) {
  const preferencesUrl = `${SITE_URL}/community/digest/preferences?email=${encodeURIComponent(params.email)}`;
  const topicsLine = params.topicTitles.map(escapeHtml).join(", ");

  const subject = `Your Successbrew daily brief — ${params.dateLabel}`;

  const bodyHtml = `
    ${eyebrow("Daily Brief")}
    ${heading("Today's update is ready.")}
    ${paragraph(`Covering: ${topicsLine}.`)}
    ${ctaButton("Read today's brief (PDF)", params.pdfUrl)}
    <p style="margin:24px 0 0; text-align:center;"><a href="${preferencesUrl}" style="font-size:13px; color:#0037D2;">Manage your topics &rarr;</a></p>
  `;

  return { subject, html: renderEmailShell({ headerBg: "#0037D2", bodyHtml }) };
}
