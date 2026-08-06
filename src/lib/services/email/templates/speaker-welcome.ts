import { renderEmailShell, eyebrow, heading, paragraph, codeBox, ctaButton, escapeHtml, sanitizeForHeader } from "./shell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

export function buildSpeakerWelcomeEmail(params: { firstName: string; speakerCode: string }) {
  const { speakerCode } = params;
  const firstName = sanitizeForHeader(params.firstName);
  const safeFirstName = escapeHtml(firstName);

  const subject = `Welcome to Successbrew, ${firstName}! You're officially a speaker.`;

  const bodyHtml = `
    ${eyebrow("Welcome Aboard")}
    ${heading(`You're a Successbrew speaker, ${safeFirstName}.`)}
    ${paragraph("Your application was approved — welcome to the room. Here's your speaker ID for reference:")}
    ${codeBox("Speaker ID", speakerCode)}
    <p style="margin:0 0 8px; font-size:13px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#111111;">What happens next</p>
    <p style="margin:0 0 28px; font-size:14px; line-height:1.7; color:#444444;">
      Our team will reach out to schedule your podcast recording and walk you through the speaker guide.
      In the meantime, come say hello in the community.
    </p>
    ${ctaButton("Join the Community", `${SITE_URL}/community`)}
  `;

  return { subject, html: renderEmailShell({ headerBg: "#111111", bodyHtml }) };
}
