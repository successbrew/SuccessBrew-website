import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { CaseStudy } from "@prisma/client";

export const caseStudySchema = z.object({
  order: z.coerce.number().int().default(0),
  tag: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  problem: z.string().min(1, "Required"),
  strategy: z.string().min(1, "Required"),
  results: z.string().min(1, "Required"),
  reverseLayout: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean()
  ).default(false),
  showOnHomepage: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean()
  ).default(false),
  pdfUrl: z.string().optional(),
});

export type CaseStudyInput = z.infer<typeof caseStudySchema>;

export const caseStudyFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "tag", label: "Tag", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "imageUrl", label: "Cover Image URL", type: "image", required: true },
  { name: "problem", label: "Problem", type: "textarea" },
  { name: "strategy", label: "Strategy", type: "textarea" },
  { name: "results", label: "Results", type: "textarea" },
  { name: "reverseLayout", label: "Reverse Layout", type: "boolean" },
  { name: "showOnHomepage", label: "Show on Homepage", type: "boolean" },
  { name: "pdfUrl", label: "Case Study PDF (optional)", type: "file" },
];

export const caseStudyColumns: ColumnConfig<CaseStudy>[] = [
  { key: "order", label: "Order" },
  { key: "tag", label: "Tag" },
  { key: "title", label: "Title" },
];
