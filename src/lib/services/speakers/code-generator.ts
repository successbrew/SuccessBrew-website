import { prisma } from "@/lib/prisma";

/** Human-readable, collision-checked speaker code, e.g. "SPK-2026-482913". */
export async function generateSpeakerCode(): Promise<string> {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 5; attempt++) {
    const sequence = Math.floor(100000 + Math.random() * 900000);
    const code = `SPK-${year}-${sequence}`;
    const existing = await prisma.speaker.findUnique({ where: { speakerCode: code } });
    if (!existing) return code;
  }

  throw new Error("Failed to generate a unique speaker code after 5 attempts.");
}
