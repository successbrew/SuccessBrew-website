import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { generateSpeakerCode } from "./code-generator";
import type { PersonalInfo } from "@/lib/types/application";

/**
 * The only entry point for turning an APPROVED application into a real
 * Speaker record. Mirrors submitApplication()'s shape: since this is the
 * application's first (and only) move into SPEAKER_CREATED, it writes its
 * own StatusHistory/ActivityLog rows atomically alongside the Speaker
 * insert, rather than calling the generic transitionStatus() separately —
 * both must succeed or neither should.
 */
export async function createSpeakerFromApplication(applicationId: string, actorId: string) {
  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });

  if (application.status !== ApplicationStatus.APPROVED) {
    throw new Error("Only approved applications can be turned into a speaker.");
  }

  const personal = application.personal as unknown as PersonalInfo;
  const speakerCode = await generateSpeakerCode();

  const speaker = await prisma.$transaction(async (tx) => {
    const created = await tx.speaker.create({
      data: {
        speakerCode,
        applicationId: application.id,
        userId: application.userId,
        displayName: `${personal.firstName} ${personal.lastName}`,
        isPublic: true,
      },
    });

    await tx.application.update({
      where: { id: application.id },
      data: { status: ApplicationStatus.SPEAKER_CREATED },
    });

    await tx.statusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: ApplicationStatus.APPROVED,
        toStatus: ApplicationStatus.SPEAKER_CREATED,
        changedBy: actorId,
      },
    });

    await tx.activityLog.create({
      data: {
        applicationId: application.id,
        actorId,
        action: "speaker_created",
        metadata: { speakerCode },
      },
    });

    return created;
  });

  return { speaker, personal };
}
