import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Isolates this origin's browsing context from cross-origin windows/popups
  // (mitigates Spectre-style side-channel and reverse-tabnabbing attacks).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Prevents other origins from embedding our responses (images, JSON, etc.)
  // as sub-resources without an explicit CORS grant.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Blocks legacy Adobe Flash/PDF cross-domain policy file lookups.
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  // Stop advertising "X-Powered-By: Next.js" — no functional benefit, only
  // helps attackers fingerprint the stack.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // The admin panel now lives on sbh-1111.successbrew.in while the rest of
      // the app is on successbrew.in — Next.js only trusts Server Action
      // requests whose Origin matches the request's own Host by default, so
      // without this every admin create/update/delete (all Server Actions)
      // is rejected as a cross-origin request the moment it's submitted from
      // the subdomain. See src/proxy.ts for the matching host-based routing.
      allowedOrigins: ["successbrew.in", "sbh-1111.successbrew.in"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

// Wraps the config to enable source-map upload + error tracing — a no-op
// build-time step (no upload, no runtime behavior change) until SENTRY_ORG/
// SENTRY_PROJECT/SENTRY_AUTH_TOKEN are set, since there's no Sentry project yet.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  telemetry: false,
});
