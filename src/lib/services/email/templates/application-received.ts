import { renderEmailShell, eyebrow, heading, paragraph, codeBox, detailRows, escapeHtml, sanitizeForHeader } from "./shell";
import type { PersonalInfo, ProfessionalInfo } from "@/lib/types/application";

export function buildApplicationReceivedEmail(params: {
  applicationCode: string;
  categoryLabel: string;
  subCategoryLabel: string;
  personal: PersonalInfo;
  professional: ProfessionalInfo;
}) {
  const { applicationCode, categoryLabel, subCategoryLabel, personal, professional } = params;
  const firstName = sanitizeForHeader(personal.firstName);
  const safeFirstName = escapeHtml(firstName);

  const subject = `We've got your application, ${firstName} — ${applicationCode}`;

  const bodyHtml = `
    ${eyebrow("Application Received")}
    ${heading(`You're in the queue, ${safeFirstName}.`)}
    ${paragraph(
      "Thanks for applying to speak with Successbrew. Our team reviews every application by hand — here's your reference number for anything you need to follow up on:"
    )}
    ${codeBox("Application Code", applicationCode)}

    <p style="margin:0 0 8px; font-size:13px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#111111;">What you submitted</p>
    ${detailRows([
      ["Name", `${personal.firstName} ${personal.lastName}`],
      ["Email", personal.email],
      ["Phone", personal.phone],
      ["Location", `${personal.city}, ${personal.country}`],
      ["Category", `${categoryLabel} / ${subCategoryLabel}`],
      ["Company", professional.companyName],
      ["Role", professional.currentRole],
      ["LinkedIn", professional.socials?.linkedin],
    ])}

    <p style="margin:0 0 8px; font-size:13px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#111111;">What happens next</p>
    <p style="margin:0; font-size:14px; line-height:1.7; color:#444444;">
      Our team reviews your application &rarr; we may reach out for a short interview &rarr; if it's a fit, you'll
      be onboarded as a Successbrew speaker. We'll email you at every step, so no need to follow up in the meantime.
      Spotted a mistake in what's above? Just reply to this email.
    </p>
  `;

  return { subject, html: renderEmailShell({ headerBg: "#0037D2", bodyHtml }) };
}
