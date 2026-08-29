import { NextResponse } from "next/server";
import { runDailyDigest } from "@/lib/digest/run-daily-digest";
import { AnthropicNotConfiguredError } from "@/lib/digest/anthropic";

export const maxDuration = 300;

/** Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET` (set as a
 * project env var) — anyone else gets a 401. */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDailyDigest();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof AnthropicNotConfiguredError) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 503 });
    }
    console.error("daily-digest cron failed", err);
    return NextResponse.json({ error: "Daily digest run failed." }, { status: 500 });
  }
}
