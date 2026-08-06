import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // Admin dashboard lives on sbh-1111.successbrew.in while sign-in stays on
    // successbrew.in — share the session cookie across both so logging in on
    // one doesn't leave the other signed out. Unset locally (no fixed host).
    domain: process.env.NODE_ENV === "production" ? "successbrew.in" : undefined,
  },
});
