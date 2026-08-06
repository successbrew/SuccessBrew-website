import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";

export const subCategorySchema = z.object({
  categoryId: z.string().min(1, "Required"),
  label: z.string().min(1, "Required"),
  order: z.coerce.number().int().default(0),
});

export type SubCategoryInput = z.infer<typeof subCategorySchema>;

/** categoryId's options depend on the 4 fixed major categories seeded in the
 * foundation migration, fetched per-request rather than hardcoded here. */
export function subCategoryFields(categoryOptions: { value: string; label: string }[]): FieldConfig[] {
  return [
    { name: "categoryId", label: "Major Category", type: "select", options: categoryOptions },
    { name: "label", label: "Sub-Category Label", type: "text", placeholder: "e.g. FinTech" },
    { name: "order", label: "Order", type: "number" },
  ];
}

/** DataTable is a Client Component, so its row shape must be plain serializable data —
 * no relation objects or render functions crossing the server/client boundary. The
 * category label is flattened onto the row (see categoryLabel) by the caller instead. */
export interface SubCategoryRow {
  id: string;
  order: number;
  label: string;
  categoryLabel: string;
}

export const subCategoryColumns: ColumnConfig<SubCategoryRow>[] = [
  { key: "order", label: "Order" },
  { key: "label", label: "Sub-Category" },
  { key: "categoryLabel", label: "Category" },
];
