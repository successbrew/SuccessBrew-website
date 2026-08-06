import { z } from "zod";
import type { FieldConfig } from "@/lib/admin/field-types";

export const speakerProfileSchema = z.object({
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  achievements: z.string().optional(),
  topics: z.preprocess(
    (val) => (typeof val === "string" ? val.split(",").map((s) => s.trim()).filter(Boolean) : val),
    z.array(z.string())
  ),
  isPublic: z.preprocess((val) => val === "true" || val === true, z.boolean()),
});

export type SpeakerProfileInput = z.infer<typeof speakerProfileSchema>;

export const speakerProfileFields: FieldConfig[] = [
  { name: "isPublic", label: "Public Profile (no public directory page exists right now)", type: "boolean" },
  { name: "photoUrl", label: "Photo (optional — falls back to application headshot)", type: "image" },
  { name: "bio", label: "Bio", type: "textarea" },
  { name: "topics", label: "Speaking Topics", type: "tags", placeholder: "Fundraising, Growth, AI" },
  { name: "achievements", label: "Achievements", type: "textarea" },
];
