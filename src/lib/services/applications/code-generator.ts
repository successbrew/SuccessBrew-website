import { prisma } from "@/lib/prisma";
import { formatApplicationCode } from "./code-generator-format";

export { formatApplicationCode };

/**
 * Sequential, human-readable application code, e.g. "SB-2026-001". The numeric
 * part is a running counter (ApplicationCodeSequence, singleton row) that keeps
 * incrementing across year boundaries — the year segment just reflects whatever
 * year it currently is, it does not restart the counter. Only an explicit admin
 * reset (src/app/sbh-1111/settings/application-codes/actions.ts) restarts it at
 * 001. Once the counter passes 999 the code simply widens (e.g. "SB-2026-1000")
 * rather than truncating or erroring.
 *
 * The increment happens via upsert's native ON CONFLICT DO UPDATE on Postgres,
 * which is a single atomic statement — concurrent submissions can't land on the
 * same number. The uniqueness check below only matters right after a manual
 * reset lands the counter back on a number already used earlier in the same
 * year; in the steady state it should never find a collision.
 */
export async function generateApplicationCode(): Promise<string> {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 5; attempt++) {
    const sequence = await prisma.applicationCodeSequence.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", lastNumber: 1, lastYear: year },
      update: { lastNumber: { increment: 1 }, lastYear: year },
    });

    const code = formatApplicationCode(year, sequence.lastNumber);
    const existing = await prisma.application.findUnique({ where: { applicationCode: code } });
    if (!existing) return code;
  }

  throw new Error("Failed to generate a unique application code after 5 attempts.");
}

/**
 * Highest sequence number in use that the counter has actually reached (0 if
 * none). The admin "set counter" tool refuses to go below this, so the counter
 * can never be rolled back onto a number a live application already holds —
 * deleting test applications first is what frees their numbers up.
 *
 * Codes numbered above the current counter are ignored: those come from the
 * code scheme used before this counter existed (e.g. SB-2026-524076), not from
 * the counter, and generateApplicationCode() already skips over any existing
 * code when the counter eventually reaches it.
 */
export async function highestIssuedSequenceNumber(): Promise<number> {
  const sequence = await prisma.applicationCodeSequence.findUnique({ where: { id: "singleton" } });
  const counter = sequence?.lastNumber ?? 0;
  const rows = await prisma.$queryRaw<{ max: number | null }[]>`
    SELECT MAX(n) AS max FROM (
      SELECT CAST(substring("applicationCode" from '([0-9]+)$') AS BIGINT) AS n FROM "Application"
    ) codes
    WHERE n <= ${counter}
  `;
  return Number(rows[0]?.max ?? 0);
}
