import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(1, "Required"),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  coverImageUrl: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.any(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  /** Tag names; matched to existing tags by slug on save, new ones are created. */
  tags: z.array(z.string().trim().min(1).max(40, "Tags must be 40 characters or fewer")).max(6, "Use at most 6 tags").default([]),
});

export type BlogInput = z.input<typeof blogSchema>;

export function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Required").max(40, "Keep it under 40 characters"),
  description: z.string().trim().max(300, "Keep it under 300 characters").optional(),
});
