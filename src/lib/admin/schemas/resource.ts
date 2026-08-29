import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { Resource } from "@prisma/client";

export const resourceSchema = z.object({
  title: z.string().min(1, "Required"),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  description: z.string().optional(),
  resourceType: z.string().min(1, "Required"),
  url: z.string().optional(),
  storageKey: z.string().optional(),
  accessLevel: z.enum(["PUBLIC", "PAID"]).default("PAID"),
  isPublished: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(false),
  order: z.coerce.number().int().default(0),
});

export type ResourceInput = z.infer<typeof resourceSchema>;

export const resourceFields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text" },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    placeholder: "community-course-access",
    required: true,
  },
  { name: "description", label: "Description (optional)", type: "textarea" },
  { name: "resourceType", label: "Resource Type", type: "text", placeholder: "course, community, download..." },
  { name: "url", label: "URL (e.g. the Koursely course link)", type: "url" },
  {
    name: "accessLevel",
    label: "Access Level",
    type: "select",
    options: [
      { value: "PUBLIC", label: "Public" },
      { value: "PAID", label: "Paid" },
    ],
  },
  { name: "isPublished", label: "Published", type: "boolean" },
  { name: "order", label: "Order", type: "number" },
];

export const resourceColumns: ColumnConfig<Resource>[] = [
  { key: "title", label: "Title" },
  { key: "slug", label: "Slug" },
  { key: "accessLevel", label: "Access" },
  { key: "isPublished", label: "Published" },
];
