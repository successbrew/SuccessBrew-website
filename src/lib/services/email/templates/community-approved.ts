import { renderEmailShell, eyebrow, heading, paragraph, ctaButton, escapeHtml, sanitizeForHeader } from "./shell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

export function buildCommunityApprovedEmail(params: { firstName: string }) {
  const firstName = sanitizeForHeader(params.firstName);
  const safeFirstName = escapeHtml(firstName);

  const subject = `You're in, ${firstName}! Welcome to the Successbrew community`;

  const bodyHtml = `
    ${eyebrow("Application Approved")}
    ${heading(`You're in, ${safeFirstName}.`)}
    ${paragraph(
      "Great news — our team has approved your application, and you're now officially a member of the Successbrew community. Welcome!"
    )}
    ${paragraph(
      "Want deeper access? Priority event seats, mentor matching, and our premium WhatsApp group with daily business updates come with the Growth tier (₹5,000, one-time) or the Founder tier (₹1,00,000, one-time) — unlock either any time."
    )}
    ${ctaButton("Unlock Growth", `${SITE_URL}/community/join/growth`)}
    <p style="margin:16px 0 0; text-align:center;"><a href="${SITE_URL}/community/join/founder" style="font-size:13px; color:#003CD1;">Or explore the Founder tier &rarr;</a></p>
  `;

  return { subject, html: renderEmailShell({ headerBg: "#003CD1", bodyHtml }) };
}
