import * as Sentry from "@sentry/nextjs";

/** No DSN yet (account not created) — every init below no-ops safely rather
 * than throwing, so this file is a harmless dependency until then. */
const dsn = process.env.SENTRY_DSN;

export async function register() {
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
