import { ApplicationStatus } from "@prisma/client";
import { renderEmailShell, eyebrow, heading, paragraph, escapeHtml, sanitizeForHeader } from "./shell";

interface StatusCopy {
  eyebrow: string;
  heading: (firstName: string) => string;
  body: string;
}

/** Only statuses that warrant an applicant-facing email are listed here — internal-only
 * moves (e.g. SPEAKER_CREATED has its own dedicated welcome email) aren't included. */
const STATUS_COPY: Partial<Record<ApplicationStatus, StatusCopy>> = {
  UNDER_REVIEW: {
    eyebrow: "Application Update",
    heading: (n) => `We're reviewing your application, ${n}.`,
    body: "Our team is taking a closer look at what you shared. We'll follow up with next steps soon — no action needed from you right now.",
  },
  NEED_MORE_INFO: {
    eyebrow: "Action Needed",
    heading: (n) => `We need a bit more from you, ${n}.`,
    body: "Before we can move forward, our team needs some additional information — check the note below for what's missing, then reply to this email.",
  },
  INTERVIEW_SCHEDULED: {
    eyebrow: "Interview Scheduled",
    heading: (n) => `Let's talk, ${n}.`,
    body: "Your application stood out — our team would like to set up a short interview. Details below.",
  },
  REJECTED: {
    eyebrow: "Application Update",
    heading: (n) => `Thanks for applying, ${n}.`,
    body: "After careful review, we won't be moving forward with your application this time. We'd love to hear from you again in the future as Successbrew grows.",
  },
};

export function buildStatusUpdateEmail(params: {
  status: ApplicationStatus;
  firstName: string;
  applicationCode: string;
  note?: string;
}) {
  const copy = STATUS_COPY[params.status];
  if (!copy) return null;

  const subject = `${copy.eyebrow}: ${params.applicationCode}`;
  const safeFirstName = escapeHtml(sanitizeForHeader(params.firstName));

  const bodyHtml = `
    ${eyebrow(copy.eyebrow)}
    ${heading(copy.heading(safeFirstName))}
    ${paragraph(copy.body)}
    ${
      params.note
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
             <tr>
               <td style="background-color:#F0EBD8; border-radius:14px; padding:18px 22px;">
                 <p style="margin:0; font-size:14px; line-height:1.6; color:#111111;">${escapeHtml(params.note)}</p>
               </td>
             </tr>
           </table>`
        : ""
    }
  `;

  return { subject, html: renderEmailShell({ headerBg: "#0037D2", bodyHtml }) };
}
