import { prisma } from "@/lib/prisma";
import { ApplicationStatus, Prisma } from "@prisma/client";
import { generateApplicationCode } from "./code-generator";
import { assertCategoryPairValid } from "@/lib/validators/application";
import type { PersonalInfo, ProfessionalInfo, DocumentKind } from "@/lib/types/application";

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

  const email = input.personal.email.trim().toLowerCase();

  // Fast-path check for a friendly error — the @unique constraint on
  // Application.email below is the actual race-safe guarantee.
  const existing = await prisma.application.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An application has already been submitted with this email address.");
  }

  const applicationCode = await generateApplicationCode();
  const now = new Date();

  try {
    const application = await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          applicationCode,
          email,
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
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("An application has already been submitted with this email address.");
    }
    throw e;
  }
}
