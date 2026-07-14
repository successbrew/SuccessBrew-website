import { z } from "zod";
import type { FieldConfig } from "@/lib/admin/field-types";

export const siteSettingsSchema = z.object({
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const siteSettingsFields: FieldConfig[] = [
  { name: "instagramUrl", label: "Instagram URL", type: "url" },
  { name: "linkedinUrl", label: "LinkedIn URL", type: "url" },
  { name: "youtubeUrl", label: "YouTube URL", type: "url" },
  { name: "twitterUrl", label: "X (Twitter) URL", type: "url" },
  { name: "facebookUrl", label: "Facebook URL", type: "url" },
];
