import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

const { GET, POST: handlePost } = auth.handler();

export { GET };

// Accounts are provisioned only via admin invite (see sbh-1111/users/actions.ts),
// never through self-service sign-up — block it here even if a request bypasses the UI.
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (path[0] === "sign-up") {
    return NextResponse.json({ error: { message: "Sign-up is disabled." } }, { status: 403 });
  }
  return handlePost(request, context);
}
