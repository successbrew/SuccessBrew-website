"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { logAudit } from "@/lib/services/audit/log";

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
