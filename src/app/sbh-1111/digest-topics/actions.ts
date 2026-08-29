"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete, type ActionResult } from "@/lib/admin/crud";
import { digestTopicSchema } from "@/lib/admin/schemas/digest-topic";
import { formDataToObject } from "@/lib/admin/form-data";
import { runDailyDigest, type RunDailyDigestResult } from "@/lib/digest/run-daily-digest";
import { revalidatePath } from "next/cache";

const REVALIDATE = ["/sbh-1111/digest-topics"];

export async function createDigestTopic(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  return runCreate(prisma.digestTopic, digestTopicSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateDigestTopic(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  return runUpdate(prisma.digestTopic, digestTopicSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteDigestTopic(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.digestTopic, id, REVALIDATE);
}

/** Manual trigger for the same pipeline the cron job runs — lets an admin
 * test end-to-end or backfill/retry a day without waiting for the schedule.
 * Idempotent (see run-daily-digest.ts), so it's always safe to click. */
export async function sendDigestNowAction(): Promise<ActionResult & { result?: RunDailyDigestResult }> {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  try {
    const result = await runDailyDigest();
    revalidatePath("/sbh-1111/digest-topics");
    return { success: true, result };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to run the daily digest." };
  }
}
