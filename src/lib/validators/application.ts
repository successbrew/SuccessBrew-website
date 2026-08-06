import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ── Step 1: Personal Information ─────────────────────────────────────────────
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "Required").max(100),
  lastName: z.string().min(1, "Required").max(100),
  email: z.string().email("Enter a valid email").max(254),
  phone: z.string().min(6, "Enter a valid phone number").max(30),
  country: z.string().min(1, "Required").max(100),
  city: z.string().min(1, "Required").max(100),
  birthday: z.string().min(1, "Required").max(20),
  gender: z.string().min(1, "Required").max(50),
  headshotUrl: z.string().url().max(2048).optional(),
});
export const personalInfoDraftSchema = personalInfoSchema.partial();

// ── Step 2: Category selection ───────────────────────────────────────────────
export const categorySelectionSchema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  subCategoryId: z.string().min(1, "Select a sub-category"),
});

/** Submit-time check that the chosen sub-category actually belongs to the chosen category. */
export async function assertCategoryPairValid(categoryId: string, subCategoryId: string) {
  const subCategory = await prisma.subCategory.findUnique({
    where: { id: subCategoryId },
    include: { category: true },
  });
  if (!subCategory || subCategory.categoryId !== categoryId) {
    throw new Error("Selected sub-category does not belong to the selected category.");
  }
  return { categoryLabel: subCategory.category.label, subCategoryLabel: subCategory.label };
}

// ── Steps 3-4: Professional Information + Online Presence ───────────────────
const socialsSchema = z.object({
  linkedin: z.string().url("Enter a valid LinkedIn URL").max(2048),
  instagram: z.string().url().max(2048).optional(),
  twitter: z.string().url().max(2048).optional(),
  youtube: z.string().url().max(2048).optional(),
  website: z.string().url().max(2048).optional(),
  portfolio: z.string().url().max(2048).optional(),
  podcastLinks: z.array(z.string().url().max(2048)).max(20).optional(),
  articles: z.array(z.string().url().max(2048)).max(20).optional(),
});

export const professionalInfoSchema = z.object({
  companyName: z.string().min(1, "Required").max(150),
  currentRole: z.string().min(1, "Required").max(150),
  yearsExperience: z.coerce.number().int().min(0).max(100),
  companyWebsite: z.string().url().max(2048).optional(),
  industry: z.string().min(1, "Required").max(100),
  revenue: z.string().max(100).optional(),
  fundingStage: z.string().max(100).optional(),
  teamSize: z.string().max(100).optional(),
  communitySize: z.string().max(100).optional(),
  speakingExperience: z.string().max(2000).optional(),
  socials: socialsSchema,
});
export const professionalInfoDraftSchema = professionalInfoSchema.partial();

// ── Uploads (optional) ────────────────────────────────────────────────────────
export const DOCUMENT_KINDS = ["RESUME", "MEDIA_KIT", "DECK", "LOGO", "HEADSHOT"] as const;
export const documentUploadSchema = z.object({
  kind: z.enum(DOCUMENT_KINDS),
  url: z.string().url().max(2048),
});

// ── Draft autosave: everything optional, saved as-you-go ─────────────────────
export const applicationDraftSchema = z.object({
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  personal: personalInfoDraftSchema.optional(),
  professional: professionalInfoDraftSchema.optional(),
});

// ── Final submit — every step must be complete ────────────────────────────────
export const applicationSubmitSchema = z.object({
  categoryId: categorySelectionSchema.shape.categoryId,
  subCategoryId: categorySelectionSchema.shape.subCategoryId,
  personal: personalInfoSchema,
  professional: professionalInfoSchema,
});
