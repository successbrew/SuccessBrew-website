import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
/**
 * Don't throw at import-time — many pages import email helpers during
 * build-time. If the API key is missing, provide a small stub that logs
 * and throws when used; the `sendEmail` wrapper will catch failures and
 * record them in the DB so build doesn't fail.
 */
export const resend: any = RESEND_API_KEY
  ? new Resend(RESEND_API_KEY)
  : {
      emails: {
        send: async () => {
          console.warn("RESEND_API_KEY is not set — emails will not be sent.");
          throw new Error("RESEND_API_KEY not configured");
        },
      },
    };

const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO_EMAIL ?? RESEND_FROM_EMAIL;

const _emailFrom = RESEND_FROM_EMAIL ?? "Successbrew <onboarding@resend.dev>";
if (!RESEND_FROM_EMAIL && process.env.NODE_ENV === "production") {
  console.warn(
    "RESEND_FROM_EMAIL is not set in production — please set a verified sender (e.g. 'Successbrew <no-reply@successbrew.in>') to improve deliverability."
  );
}

export const EMAIL_FROM: string = _emailFrom;

export const REPLY_TO_EMAIL: string = (RESEND_REPLY_TO_EMAIL ?? EMAIL_FROM) as string;

/** Where "notify the team" emails go — configurable without a code change. */
export const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "team@successbrew.in";
