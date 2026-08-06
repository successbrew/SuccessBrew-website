import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { generateApplicationCode } from "./code-generator";
import { assertCategoryPairValid } from "@/lib/validators/application";
import type { PersonalInfo, ProfessionalInfo, DocumentKind } from "@/lib/types/application";
import type { Prisma } from "@prisma/client";

interface SubmitApplicationInput {
  /** Neon Auth user id when the applicant happens to be signed in — null for
   * anonymous submissions, which is the common case (login is never required). */
  userId: string | null;
  categoryId: string;
  subCategoryId: string;
  personal: PersonalInfo;
  professional: ProfessionalInfo;
  documents: { kind: DocumentKind; url: string }[];
}

/**
 * The only entry point for turning a filled-out wizard into a real Application
 * row. Unlike admin-side status moves (see status-transitions.ts), there's no
 * existing row to transition from here — the application is born already
 * submitted, so this writes its own StatusHistory/ActivityLog rows directly
 * rather than going through transitionStatus().
 */
export async function submitApplication(input: SubmitApplicationInput) {
  const { categoryLabel, subCategoryLabel } = await assertCategoryPairValid(input.categoryId, input.subCategoryId);

  const applicationCode = await generateApplicationCode();
  const now = new Date();

  const application = await prisma.$transaction(async (tx) => {
    const application = await tx.application.create({
      data: {
        applicationCode,
        userId: input.userId,
        status: ApplicationStatus.SUBMITTED,
        categoryId: input.categoryId,
        subCategoryId: input.subCategoryId,
        personal: input.personal as unknown as Prisma.InputJsonValue,
        professional: input.professional as unknown as Prisma.InputJsonValue,
        submittedAt: now,
        documents: {
          create: input.documents.map((d) => ({ kind: d.kind, url: d.url })),
        },
      },
    });

    await tx.statusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: null,
        toStatus: ApplicationStatus.SUBMITTED,
        changedBy: input.userId ?? "anonymous",
      },
    });

    await tx.activityLog.create({
      data: {
        applicationId: application.id,
        actorId: input.userId ?? "anonymous",
        action: "application_submitted",
      },
    });

    return application;
  });

  return { application, categoryLabel, subCategoryLabel };
}
