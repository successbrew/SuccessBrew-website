import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { EventSpeaker } from "@prisma/client";

export const eventSpeakerSchema = z.object({
  eventId: z.string().min(1),
  order: z.coerce.number().int().default(0),
  name: z.string().min(1, "Required"),
  role: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type EventSpeakerInput = z.infer<typeof eventSpeakerSchema>;

export const eventSpeakerFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "name", label: "Name", type: "text" },
  { name: "role", label: "Role (optional)", type: "text", placeholder: "Founder · Wildbrew Coffee" },
  { name: "bio", label: "Short Bio (optional)", type: "textarea" },
  { name: "photoUrl", label: "Photo (optional)", type: "image" },
];

export const eventSpeakerColumns: ColumnConfig<EventSpeaker>[] = [
  { key: "order", label: "Order" },
  { key: "name", label: "Name" },
];
