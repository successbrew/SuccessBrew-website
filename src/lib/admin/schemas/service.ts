import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { Service } from "@prisma/client";

export const serviceSchema = z.object({
  order: z.coerce.number().int().default(0),
  num: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  tags: z.preprocess(
    (val) => (typeof val === "string" ? val.split(",").map((s) => s.trim()).filter(Boolean) : val),
    z.array(z.string())
  ),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const serviceFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "num", label: "Number Label", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "tags", label: "Tags", type: "tags", placeholder: "Strategy, Copy" },
];

export const serviceColumns: ColumnConfig<Service>[] = [
  { key: "order", label: "Order" },
  { key: "num", label: "Num" },
  { key: "title", label: "Title" },
];
