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
  subtitle: z.string().optional(),
  timeRange: z.string().optional(),
  priceNote: z.string().optional(),
  audienceNote: z.string().optional(),
  highlightStatValue: z.string().optional(),
  highlightStatLabel: z.string().optional(),
  totalSeats: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const n = typeof val === "string" ? Number(val) : val;
    return Number.isNaN(n) ? undefined : n;
  }, z.number().int().optional()),
  agenda: z.string().optional(),
  hostName: z.string().optional(),
  hostRole: z.string().optional(),
  hostBio: z.string().optional(),
  hostPhotoUrl: z.string().optional(),
  venueAddress: z.string().optional(),
  venuePhotoUrl: z.string().optional(),
  benefits: z.preprocess(
    (val) => (typeof val === "string" ? val.split("\n").map((s) => s.trim()).filter(Boolean) : val),
    z.array(z.string())
  ).optional(),
  becomePartnerUrl: z.string().optional(),
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
  { name: "registerUrl", label: "Register / Fill Link (optional)", type: "url" },
  { name: "seatsNote", label: "Seats Note (optional)", type: "text", placeholder: "61 of 300 left" },
  { name: "subtitle", label: "Landing Page Subtitle (optional)", type: "textarea", placeholder: "One or two sentences under the title on the event's own page." },
  { name: "timeRange", label: "Time Range (optional)", type: "text", placeholder: "6:30 – 10:00 PM" },
  { name: "priceNote", label: "Price / Eligibility Note (optional)", type: "text", placeholder: "Free for members · ₹999 guests" },
  { name: "totalSeats", label: "Total Seats (optional)", type: "number" },
  { name: "highlightStatValue", label: "Highlight Stat Value (optional)", type: "text", placeholder: "6" },
  { name: "highlightStatLabel", label: "Highlight Stat Label (optional)", type: "text", placeholder: "Matched intros each" },
  { name: "audienceNote", label: "Who's in the Room (optional)", type: "textarea" },
  { name: "agenda", label: "Agenda (optional, one per line: Time | Title | Description)", type: "textarea", placeholder: "6:30 PM | Doors, badges, first drink | Pick up your neon lanyard and printed intro list." },
  { name: "hostName", label: "Host Name (optional)", type: "text" },
  { name: "hostRole", label: "Host Role (optional)", type: "text", placeholder: "Community team" },
  { name: "hostBio", label: "Host Bio (optional)", type: "textarea" },
  { name: "hostPhotoUrl", label: "Host Photo (optional)", type: "image" },
  { name: "venueAddress", label: "Venue / Address (optional)", type: "textarea" },
  { name: "venuePhotoUrl", label: "Venue Photo (optional)", type: "image" },
  { name: "benefits", label: "What You'll Leave With (optional, one per line: Title | Description)", type: "textarea", placeholder: "Six warm intros | Matched on what you're building and what you need." },
  { name: "becomePartnerUrl", label: "Become a Partner Link (optional)", type: "url" },
];

export const communityEventColumns: ColumnConfig<CommunityEvent>[] = [
  { key: "order", label: "Order" },
  { key: "title", label: "Title" },
  { key: "tag", label: "Tag" },
  { key: "category", label: "Category" },
];
