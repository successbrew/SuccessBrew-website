"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { logAudit } from "@/lib/services/audit/log";
import { highestIssuedSequenceNumber } from "@/lib/services/applications/code-generator";

type ActionResult = { success: true; newValue: number } | { error: string };

/** Restarts the application-code counter at 0 (so the next issued code is
 * "SB-<year>-001"). Already-issued codes are untouched. SUPER_ADMIN-only —
 * this affects code numbering for every future application site-wide. */
export async function resetApplicationCodeSequence(): Promise<ActionResult> {
  const admin = await requireSuperAdmin();

  const previous = await prisma.applicationCodeSequence.findUnique({ where: { id: "singleton" } });

  await prisma.applicationCodeSequence.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", lastNumber: 0 },
    update: { lastNumber: 0 },
  });

  await logAudit({
    actorId: admin.id,
    action: "application_code_sequence_reset",
    targetType: "ApplicationCodeSequence",
    targetId: "singleton",
    metadata: { previousLastNumber: previous?.lastNumber ?? 0 },
  }).catch(() => {});

  revalidatePath("/sbh-1111/settings/application-codes");
  return { success: true, newValue: 0 };
}

/** Sets the counter to a specific "last issued" number, e.g. to wind it back
 * after deleting test applications. Refuses anything below the highest code
 * still in use, so no future code can repeat a live one. SUPER_ADMIN-only. */
export async function setApplicationCodeSequence(lastNumber: number): Promise<ActionResult> {
  const admin = await requireSuperAdmin();

  if (!Number.isInteger(lastNumber) || lastNumber < 0 || lastNumber > 1_000_000) {
    return { error: "Enter a whole number of 0 or more." };
  }
  const highestInUse = await highestIssuedSequenceNumber();
  if (lastNumber < highestInUse) {
    return {
      error: `An application still holds number ${highestInUse}. Delete it first, or set the counter to ${highestInUse} or higher.`,
    };
  }

  const previous = await prisma.applicationCodeSequence.findUnique({ where: { id: "singleton" } });

  await prisma.applicationCodeSequence.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", lastNumber },
    update: { lastNumber },
  });

  await logAudit({
    actorId: admin.id,
    action: "application_code_sequence_set",
    targetType: "ApplicationCodeSequence",
    targetId: "singleton",
    metadata: { previousLastNumber: previous?.lastNumber ?? 0, newLastNumber: lastNumber },
  }).catch(() => {});

  revalidatePath("/sbh-1111/settings/application-codes");
  return { success: true, newValue: lastNumber };
}
