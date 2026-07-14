import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { Testimonial } from "@prisma/client";

export const testimonialSchema = z.object({
  order: z.coerce.number().int().default(0),
  quote: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  role: z.string().min(1, "Required"),
  initial: z.string().min(1, "Required"),
  cardStyle: z.enum(["SAND", "DARK"]),
  avatarStyle: z.enum(["PRIMARY", "ACCENT"]),
  group: z.enum(["SERVICE", "COMMUNITY"]).default("SERVICE"),
  showOnHomepage: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean()
  ).default(false),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const testimonialFields: FieldConfig[] = [
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
      { value: "DARK", label: "Dark" },
    ],
  },
  {
    name: "avatarStyle",
    label: "Avatar Style",
    type: "select",
    options: [
      { value: "PRIMARY", label: "Primary" },
      { value: "ACCENT", label: "Accent" },
    ],
  },
  {
    name: "group",
    label: "Group",
    type: "select",
    options: [
      { value: "SERVICE", label: "Service (clients — /testimonials)" },
      { value: "COMMUNITY", label: "Community (/community/testimonials)" },
    ],
  },
  { name: "showOnHomepage", label: "Show on Homepage (Service page only)", type: "boolean" },
];

export const testimonialColumns: ColumnConfig<Testimonial>[] = [
  { key: "order", label: "Order" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "group", label: "Group" },
];
