import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { isSuperAdminSession } from "@/lib/auth/dal";

const { GET: handleGet, POST: handlePost } = auth.handler();

function forbidden() {
  return NextResponse.json({ error: { message: "Forbidden." } }, { status: 403 });
}

// Neon Auth's provider-native admin/* endpoints (set-role, ban-user,
// impersonate-user, remove-user, set-user-password, list-users, ...) are
// reachable through this catch-all by default. They carry none of our own
// granular permission checks, so any authenticated admin — not just a
// SUPER_ADMIN — could otherwise call them directly to manage other accounts,
// bypassing src/app/sbh-1111/users/actions.ts entirely. Gate the whole
// admin/* namespace on our own SUPER_ADMIN check before forwarding.
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (path[0] === "admin" && !(await isSuperAdminSession())) {
    return forbidden();
  }
  return handleGet(request, context);
}

// Accounts are provisioned only via admin invite (see sbh-1111/users/actions.ts),
// never through self-service sign-up — block it here even if a request bypasses the UI.
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (path[0] === "sign-up") {
    return NextResponse.json({ error: { message: "Sign-up is disabled." } }, { status: 403 });
  }
  if (path[0] === "admin" && !(await isSuperAdminSession())) {
    return forbidden();
  }
  return handlePost(request, context);
}
