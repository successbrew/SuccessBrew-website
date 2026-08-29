import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { DigestTopic } from "@prisma/client";

export const digestTopicSchema = z.object({
  title: z.string().min(1, "Required"),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(true),
  order: z.coerce.number().int().default(0),
});

export type DigestTopicInput = z.infer<typeof digestTopicSchema>;

export const digestTopicFields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text", placeholder: "AI in India" },
  { name: "slug", label: "Slug", type: "text", placeholder: "ai-in-india", required: true },
  { name: "isActive", label: "Active (members can select it, briefs get generated daily)", type: "boolean" },
  { name: "order", label: "Order", type: "number" },
];

export const digestTopicColumns: ColumnConfig<DigestTopic>[] = [
  { key: "order", label: "Order" },
  { key: "title", label: "Title" },
  { key: "slug", label: "Slug" },
  { key: "isActive", label: "Active" },
];
