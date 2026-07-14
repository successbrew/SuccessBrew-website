import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { CommunityWin } from "@prisma/client";

export const communityWinSchema = z.object({
  order: z.coerce.number().int().default(0),
  quote: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  role: z.string().min(1, "Required"),
  initial: z.string().min(1, "Required"),
  cardStyle: z.enum(["SAND", "BLUE", "DARK"]),
  avatarStyle: z.enum(["BLUE", "LIME"]),
});

export type CommunityWinInput = z.infer<typeof communityWinSchema>;

export const communityWinFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "quote", label: "Quote", type: "textarea" },
  { name: "name", label: "Name", type: "text" },
  { name: "role", label: "Role", type: "text" },
  { name: "initial", label: "Avatar Initial", type: "text", placeholder: "single letter" },
  {
    name: "cardStyle",
    label: "Card Style",
    type: "select",
    options: [
      { value: "SAND", label: "Sand" },
      { value: "BLUE", label: "Blue" },
      { value: "DARK", label: "Dark" },
    ],
  },
  {
    name: "avatarStyle",
    label: "Avatar Style",
    type: "select",
    options: [
      { value: "BLUE", label: "Blue" },
      { value: "LIME", label: "Lime" },
    ],
  },
];

export const communityWinColumns: ColumnConfig<CommunityWin>[] = [
  { key: "order", label: "Order" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
];
