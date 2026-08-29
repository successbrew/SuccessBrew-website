import { renderEmailShell, eyebrow, heading, paragraph, ctaButton, escapeHtml, sanitizeForHeader } from "./shell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

export function buildCommunityApprovedEmail(params: { firstName: string }) {
  const firstName = sanitizeForHeader(params.firstName);
  const safeFirstName = escapeHtml(firstName);

  const subject = `You're approved, ${firstName} — unlock Growth or Founder access`;

  const bodyHtml = `
    ${eyebrow("Application Approved")}
    ${heading(`Welcome in, ${safeFirstName}.`)}
    ${paragraph(
      "You're officially part of the Successbrew community. If you want deeper access — priority event seats, mentor matching, and our premium WhatsApp group with daily business updates — you can unlock the Growth tier (₹5,000, one-time) or the Founder tier (₹1,00,000, one-time) any time."
    )}
    ${ctaButton("Unlock Growth", `${SITE_URL}/community/join/growth`)}
    <p style="margin:16px 0 0; text-align:center;"><a href="${SITE_URL}/community/join/founder" style="font-size:13px; color:#0037D2;">Or explore the Founder tier &rarr;</a></p>
  `;

  return { subject, html: renderEmailShell({ headerBg: "#0037D2", bodyHtml }) };
}
