import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { CaseStudy } from "@prisma/client";

const metricSchema = z.object({
  metric: z.string().optional(),
  value: z.string().min(1, "Value required"),
  label: z.string().min(1, "Label required"),
});

const strategyStepSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().min(1, "Description required"),
});

const timelineStepSchema = z.object({
  order: z.number().optional(),
  title: z.string().min(1, "Title required"),
  description: z.string().min(1, "Description required"),
});

export const caseStudySchema = z.object({
  order: z.coerce.number().int().default(0),
  tag: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  clientName: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
  problem: z.string().min(1, "Required"),
  strategy: z.string().min(1, "Required"),
  solutionContent: z.string().optional(),
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
  heroMetrics: z.union([
    z.string().transform((s) => {
      try {
        return JSON.parse(s);
      } catch {
        return [];
      }
    }),
    z.array(metricSchema),
  ]).default([]),
  beforeAfter: z.union([
    z.string().transform((s) => {
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    }),
    z.object({
      before: z.string().optional(),
      after: z.string().optional(),
    }).nullable(),
  ]).optional(),
  strategySteps: z.union([
    z.string().transform((s) => {
      try {
        return JSON.parse(s);
      } catch {
        return [];
      }
    }),
    z.array(strategyStepSchema),
  ]).default([]),
  resultMetrics: z.union([
    z.string().transform((s) => {
      try {
        return JSON.parse(s);
      } catch {
        return [];
      }
    }),
    z.array(metricSchema),
  ]).default([]),
  timelineSteps: z.union([
    z.string().transform((s) => {
      try {
        return JSON.parse(s);
      } catch {
        return [];
      }
    }),
    z.array(timelineStepSchema),
  ]).default([]),
});

export type CaseStudyInput = z.infer<typeof caseStudySchema>;

export const caseStudyFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "tag", label: "Tag", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "clientName", label: "Client Name (optional)", type: "text" },
  { name: "description", label: "Short Description (optional)", type: "textarea" },
  { name: "imageUrl", label: "Cover Image URL", type: "image", required: true },
  { name: "problem", label: "Challenge / Problem", type: "textarea" },
  { name: "strategy", label: "Strategy (Summary)", type: "textarea" },
  { name: "solutionContent", label: "Solution Description (optional)", type: "textarea" },
  { name: "results", label: "Results Summary", type: "textarea" },
  { name: "reverseLayout", label: "Reverse Layout", type: "boolean" },
  { name: "showOnHomepage", label: "Show on Homepage", type: "boolean" },
  { name: "pdfUrl", label: "Case Study PDF (optional)", type: "file" },
];

export const caseStudyColumns: ColumnConfig<CaseStudy>[] = [
  { key: "order", label: "Order" },
  { key: "tag", label: "Tag" },
  { key: "title", label: "Title" },
];
