import { NextResponse } from "next/server";
import { reconcilePayments } from "@/lib/commerce/reconcile";

export const maxDuration = 300;

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await reconcilePayments();
  return NextResponse.json(result, { status: result.failed ? 503 : 200 });
}
