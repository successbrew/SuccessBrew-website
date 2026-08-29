import * as Sentry from "@sentry/nextjs";

/** No DSN yet — safe no-op until one is added to Vercel's env vars.
 * NEXT_PUBLIC_ prefix is required: this file ships to the browser. */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
