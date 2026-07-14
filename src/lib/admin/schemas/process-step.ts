import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { ProcessStep } from "@prisma/client";

export const processStepSchema = z.object({
  order: z.coerce.number().int().default(0),
  stepNumber: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});

export type ProcessStepInput = z.infer<typeof processStepSchema>;

export const processStepFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "stepNumber", label: "Step Number", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
];

export const processStepColumns: ColumnConfig<ProcessStep>[] = [
  { key: "order", label: "Order" },
  { key: "stepNumber", label: "Step Number" },
  { key: "title", label: "Title" },
];
