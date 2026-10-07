import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ── Step 1: Personal Information ─────────────────────────────────────────────
export const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  email: z.string().email("Enter a valid email").max(254),
  phone: z.string().min(6, "Enter a valid phone number").max(30),
  country: z.string().min(1, "Required").max(100),
  city: z.string().min(1, "Required").max(100),
  birthday: z.string().min(1, "Required").max(20),
  gender: z.string().min(1, "Required").max(50),
  // Not a public URL — an opaque S3 object key returned by /api/apply/upload
  // (see H5 in the security audit), resolved to a signed URL only when an
  // authorized admin views the application.
  headshotUrl: z.string().min(1).max(2048).optional(),
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
/** Applicants paste links however they have them: trim, treat a cleared field
 * as not provided, and add the https:// most people leave off ("linkedin.com/in/me"). */
export function normalizeUrl(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
const webUrl = (label: string) =>
  z.url({ protocol: /^https?$/, hostname: z.regexes.domain, error: `Enter a valid ${label} link` }).max(2048);
const requiredUrl = (label: string) => z.preprocess(normalizeUrl, webUrl(label));
const optionalUrl = (label: string) => z.preprocess(normalizeUrl, webUrl(label).optional());

const socialsSchema = z.object({
  linkedin: requiredUrl("LinkedIn"),
  instagram: optionalUrl("Instagram"),
  twitter: optionalUrl("Twitter / X"),
  youtube: optionalUrl("YouTube"),
  website: optionalUrl("website"),
  portfolio: optionalUrl("portfolio"),
  podcastLinks: z.array(requiredUrl("podcast")).max(20).optional(),
  articles: z.array(requiredUrl("article")).max(20).optional(),
});

export const professionalInfoSchema = z.object({
  companyName: z.string().min(1, "Required").max(150),
  currentRole: z.string().min(1, "Required").max(150),
  yearsExperience: z.coerce.number().int().min(0).max(100),
  companyWebsite: optionalUrl("company website"),
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
  // Opaque S3 object key, not a public URL (see headshotUrl above).
  url: z.string().min(1).max(2048),
});

// ── Draft autosave: everything optional, saved as-you-go ─────────────────────
export const applicationDraftSchema = z.object({
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  personal: personalInfoDraftSchema.optional(),
  professional: professionalInfoDraftSchema.optional(),
});

// ── Final submit — every step must be complete ────────────────────────────────
/** Which on-site CTA the applicant came through — drives notification/email copy only. */
export const applicationSourceSchema = z.enum(["SPEAKER", "COMMUNITY"]).default("SPEAKER");

export const applicationSubmitSchema = z.object({
  categoryId: categorySelectionSchema.shape.categoryId,
  subCategoryId: categorySelectionSchema.shape.subCategoryId,
  personal: personalInfoSchema,
  professional: professionalInfoSchema,
  source: applicationSourceSchema,
});
