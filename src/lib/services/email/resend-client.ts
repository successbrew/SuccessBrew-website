import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

/** Falls back to a Resend sandbox sender until a verified domain sender is configured. */
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? "Successbrew <onboarding@resend.dev>";

/** Where "notify the team" emails go — configurable without a code change. */
export const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "team@successbrew.in";
