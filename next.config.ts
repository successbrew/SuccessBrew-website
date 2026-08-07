import type { NextConfig } from "next";

// Content is admin-authored via /sbh-1111 and can reference arbitrary external
// image URLs (see field-types.ts), so img-src stays permissive to https:
// rather than an allowlist. script-src/style-src use 'unsafe-inline' because
// this app has a mix of statically and dynamically rendered pages, which
// rules out per-request nonces (nonces require every page to render
// dynamically). The other directives (object-src, frame-ancestors, base-uri,
// form-action) still meaningfully cut down the attack surface.
//
// 'unsafe-eval' is added to script-src in development only — Turbopack/React's
// dev-mode tooling uses eval() to reconstruct cross-boundary stack traces
// (React explicitly never uses eval() in production), so without it dev
// logs a spurious "eval() is not supported" console error on every page.
const isDev = process.env.NODE_ENV === "development";
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data: blob:;
  font-src 'self' data:;
  connect-src 'self' https://*.amazonaws.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
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

export default nextConfig;
