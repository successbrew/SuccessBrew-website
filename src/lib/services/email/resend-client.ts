import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  throw new Error(
    "Missing required env var RESEND_API_KEY. Set your Resend API key in .env.local or your deployment environment."
  );
}

export const resend = new Resend(RESEND_API_KEY);

const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO_EMAIL ?? RESEND_FROM_EMAIL;

export const EMAIL_FROM =
  RESEND_FROM_EMAIL ??
  (process.env.NODE_ENV === "development" ? "Successbrew <onboarding@resend.dev>" : undefined);

if (!EMAIL_FROM) {
  throw new Error(
    "Missing required env var RESEND_FROM_EMAIL. In production, this must be a verified Resend sender address for successbrew.in, e.g. 'Successbrew <no-reply@successbrew.in>'."
  );
}

export const REPLY_TO_EMAIL = RESEND_REPLY_TO_EMAIL ?? EMAIL_FROM;

/** Where "notify the team" emails go — configurable without a code change. */
export const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "team@successbrew.in";
