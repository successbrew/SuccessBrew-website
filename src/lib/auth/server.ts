import { createNeonAuth } from "@neondatabase/auth/next/server";

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL;
const NEON_AUTH_COOKIE_SECRET = process.env.NEON_AUTH_COOKIE_SECRET;

if (!NEON_AUTH_BASE_URL || !NEON_AUTH_COOKIE_SECRET) {
  throw new Error(
    "Missing required env vars: NEON_AUTH_BASE_URL and/or NEON_AUTH_COOKIE_SECRET.\n" +
      "Set them in your local .env.local or in your deployment environment. Example:\n" +
      "NEON_AUTH_BASE_URL=https://your-neon-auth-host.com\n" +
      "NEON_AUTH_COOKIE_SECRET=some-32+chars-secret"
  );
}

export const auth = createNeonAuth({
  baseUrl: NEON_AUTH_BASE_URL,
  cookies: {
    secret: NEON_AUTH_COOKIE_SECRET,
    // Admin dashboard lives on sbh-1111.successbrew.in while sign-in stays on
    // successbrew.in — share the session cookie across both so logging in on
    // one doesn't leave the other signed out. Unset locally (no fixed host).
    domain: process.env.NODE_ENV === "production" ? "successbrew.in" : undefined,
  },
});
