import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { CommunityEvent } from "@prisma/client";
import { EVENT_CATEGORIES } from "@/lib/event-categories";

export const communityEventSchema = z.object({
  order: z.coerce.number().int().default(0),
  isFeatured: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(false),
  tag: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  eventDate: z.coerce.date(),
  category: z.enum(["TECH_INTEGRATE", "D2C", "INVESTORS", "RETREATS", "MEGA_EVENTS", "GENERAL"]).default("GENERAL"),
  location: z.string().min(1, "Required"),
  speaker: z.string().optional(),
  imageUrl: z.string().optional(),
  registerUrl: z.string().optional(),
  seatsNote: z.string().optional(),
});

export type CommunityEventInput = z.infer<typeof communityEventSchema>;

export const communityEventFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "isFeatured", label: "Featured", type: "boolean" },
  { name: "tag", label: "Tag", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "date", label: "Date (as displayed)", type: "text", placeholder: "Aug 9–10, 2025" },
  { name: "eventDate", label: "Event Date (drives sorting & past/upcoming)", type: "date", required: true },
  { name: "category", label: "Category", type: "select", options: [...EVENT_CATEGORIES] },
  { name: "location", label: "Location", type: "text" },
  { name: "speaker", label: "Speaker (optional)", type: "text" },
  { name: "imageUrl", label: "Cover Image URL (optional)", type: "image" },
  { name: "registerUrl", label: "Register URL (optional)", type: "url" },
  { name: "seatsNote", label: "Seats Note (optional)", type: "text" },
];

export const communityEventColumns: ColumnConfig<CommunityEvent>[] = [
  { key: "order", label: "Order" },
  { key: "title", label: "Title" },
  { key: "tag", label: "Tag" },
  { key: "category", label: "Category" },
];
