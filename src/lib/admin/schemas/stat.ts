import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { Stat } from "@prisma/client";

export const statSchema = z.object({
  order: z.coerce.number().int().default(0),
  number: z.string().min(1, "Required"),
  label: z.string().min(1, "Required"),
  colorScheme: z.enum(["DEFAULT", "PRIMARY", "ACCENT"]),
});

export type StatInput = z.infer<typeof statSchema>;

export const statFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "number", label: "Number", type: "text", placeholder: "200K+" },
  { name: "label", label: "Label", type: "text", placeholder: "Followers" },
  {
    name: "colorScheme",
    label: "Color Scheme",
    type: "select",
    options: [
      { value: "DEFAULT", label: "Default (Sand)" },
      { value: "PRIMARY", label: "Primary (Blue)" },
      { value: "ACCENT", label: "Accent (Lime)" },
    ],
  },
];

export const statColumns: ColumnConfig<Stat>[] = [
  { key: "order", label: "Order" },
  { key: "number", label: "Number" },
  { key: "label", label: "Label" },
];
