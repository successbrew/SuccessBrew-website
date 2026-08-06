import { prisma } from "@/lib/prisma";

/** Human-readable, collision-checked application code, e.g. "SB-2026-482913". */
export async function generateApplicationCode(): Promise<string> {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 5; attempt++) {
    const sequence = Math.floor(100000 + Math.random() * 900000);
    const code = `SB-${year}-${sequence}`;
    const existing = await prisma.application.findUnique({ where: { applicationCode: code } });
    if (!existing) return code;
  }

  throw new Error("Failed to generate a unique application code after 5 attempts.");
}
