import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

/**
 * The admin dashboard is served only from the "sbh-1111." subdomain (e.g.
 * sbh-1111.successbrew.in, or sbh-1111.localhost:3000 in dev) — /sbh-1111
 * 404s on every other host so it isn't reachable from the public site.
 * /auth/* and /api/* keep working on every host (see the "keep auth on the
 * main domain" call made when this was set up).
 */
const ADMIN_HOST_PREFIX = "sbh-1111.";

const requireAdminSession = auth.middleware({ loginUrl: "/auth/sign-in" });

export default async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const isAdminHost = host.startsWith(ADMIN_HOST_PREFIX);
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname === "/sbh-1111" || pathname.startsWith("/sbh-1111/");

  if (!isAdminHost) {
    if (isAdminPath) {
      return NextResponse.rewrite(new URL("/__admin_not_found__", request.url));
    }
    return NextResponse.next();
  }

  // /auth/* (sign-in, password reset) and every /api/* route (including
  // /api/auth/*) serve their real paths unchanged on the admin host too.
  if (pathname.startsWith("/auth") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Server Actions (form submissions in the admin panel) are POSTs to the
  // current page, tagged with this header by Next.js. Don't run the full
  // session-redirect gate on them: a plain HTTP redirect here isn't
  // recognized by the client's Server Action protocol (which only honors
  // redirects that carry `x-action-redirect`, set by `redirect()` calls
  // inside the action) and breaks with "An unexpected response was received
  // from the server" instead of navigating to sign-in. `verifyAdminSession()`
  // inside every action (see dal.ts) is the authoritative check and already
  // redirects correctly when the session is invalid.
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  const gateResult = await requireAdminSession(request);
  if (gateResult.headers.get("location")) {
    return gateResult;
  }

  // Existing admin links already point at /sbh-1111/... — only bare paths
  // (typed directly, or the bare "/") need the prefix added.
  if (isAdminPath) {
    return gateResult;
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/sbh-1111" : `/sbh-1111${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Next's own file-based metadata routes (icon.jpg, apple-icon, etc.) need to
  // stay excluded here too — otherwise the admin-host rewrite below turns
  // /icon.jpg into /sbh-1111/icon.jpg, a route that doesn't exist, and every
  // browser tab on the admin subdomain gets a 404'd favicon.
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|icon\\.|apple-icon|opengraph-image|twitter-image|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt).*)"],
};
