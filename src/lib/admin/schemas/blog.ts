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
});

export type BlogInput = z.infer<typeof blogSchema>;

export function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
