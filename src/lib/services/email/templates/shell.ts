const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

/** Every value that ends up in these templates ultimately traces back to a
 * public, unauthenticated form submission — escape before interpolating into
 * HTML, the same way JSX would, since these are built with raw template
 * literals instead. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips CR/LF from anything interpolated into an email subject line — a
 * subject built from user input (e.g. their first name) is otherwise a header
 * injection vector (a name containing "\r\nBcc: ...") before it ever reaches HTML. */
export function sanitizeForHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** Shared HTML wrapper for every transactional email — logo header, white card
 * body, dark footer. Individual templates only need to build the inner bodyHtml. */
export function renderEmailShell(params: { headerBg: string; bodyHtml: string }) {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0; padding:0; background-color:#F2ECDD; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2ECDD; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:20px; overflow:hidden;">
            <tr>
              <td style="background-color:${params.headerBg}; padding:32px 40px; text-align:center;">
                <img src="${SITE_URL}/SB-logo.png" alt="Successbrew" height="28" style="height:28px; width:auto; filter:brightness(0) invert(1);" />
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">${params.bodyHtml}</td>
            </tr>
            <tr>
              <td style="padding:24px 40px; background-color:#111111; text-align:center;">
                <p style="margin:0; font-size:12px; color:rgba(255,255,255,0.5);">
                  Successbrew &middot; India's Startup Ecosystem
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}

export function eyebrow(text: string) {
  return `<p style="margin:0 0 4px; font-size:12px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#0037D2;">${text}</p>`;
}

export function heading(text: string) {
  return `<h1 style="margin:8px 0 20px; font-size:26px; line-height:1.25; font-weight:800; color:#111111;">${text}</h1>`;
}

export function paragraph(text: string) {
  return `<p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#444444;">${text}</p>`;
}

export function codeBox(label: string, value: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#F0EBD8; border-radius:14px; padding:20px 24px; text-align:center;">
          <p style="margin:0 0 4px; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#111111; opacity:0.5;">${label}</p>
          <p style="margin:0; font-size:22px; font-weight:800; color:#0037D2; letter-spacing:0.02em;">${value}</p>
        </td>
      </tr>
    </table>`;
}

/** A label/value recap table — e.g. "here's what you submitted". Skips any row whose value is falsy. */
export function detailRows(rows: [label: string, value: string | null | undefined][]) {
  const visible = rows.filter(([, value]) => Boolean(value));
  if (visible.length === 0) return "";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${visible
        .map(
          ([label, value], i) => `
        <tr>
          <td style="padding:7px 0; font-size:14px; color:#444444; ${i < visible.length - 1 ? "border-bottom:1px solid #eee;" : ""}">${escapeHtml(label)}</td>
          <td style="padding:7px 0; font-size:14px; color:#111111; font-weight:600; text-align:right; ${i < visible.length - 1 ? "border-bottom:1px solid #eee;" : ""}">${escapeHtml(String(value))}</td>
        </tr>`
        )
        .join("")}
    </table>`;
}

export function ctaButton(label: string, href: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px; background-color:#0037D2;">
          <a href="${href}" style="display:inline-block; padding:14px 28px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;">${label}</a>
        </td>
      </tr>
    </table>`;
}
