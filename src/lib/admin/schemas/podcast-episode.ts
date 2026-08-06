import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { PodcastEpisode } from "@prisma/client";

export const podcastEpisodeSchema = z.object({
  order: z.coerce.number().int().default(0),
  isFeatured: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(false),
  episodeNumber: z.string().min(1, "Required"),
  duration: z.string().min(1, "Required"),
  guest: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  thumbnailUrl: z.string().optional(),
  listenUrl: z.string().optional(),
  speakerId: z.preprocess((val) => (val === "" || val === "__none__" ? null : val), z.string().nullable().optional()),
});

export type PodcastEpisodeInput = z.infer<typeof podcastEpisodeSchema>;

export const podcastEpisodeFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "isFeatured", label: "Featured", type: "boolean" },
  { name: "episodeNumber", label: "Episode Number", type: "text", placeholder: "EP 54" },
  { name: "duration", label: "Duration", type: "text", placeholder: "52m" },
  { name: "guest", label: "Guest (display name)", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "thumbnailUrl", label: "Thumbnail URL (optional)", type: "image" },
  { name: "listenUrl", label: "Listen URL (optional)", type: "url" },
];

/** speakerId's options depend on the current Speaker table, so it's built per-request
 * (in the page component) and appended to the static fields above rather than being static itself. */
export function podcastEpisodeFieldsWithSpeaker(speakerOptions: { value: string; label: string }[]): FieldConfig[] {
  return [
    ...podcastEpisodeFields,
    {
      name: "speakerId",
      label: "Linked Speaker (optional)",
      type: "select",
      options: [{ value: "__none__", label: "— None —" }, ...speakerOptions],
    },
  ];
}

export const podcastEpisodeColumns: ColumnConfig<PodcastEpisode>[] = [
  { key: "order", label: "Order" },
  { key: "episodeNumber", label: "Episode Number" },
  { key: "title", label: "Title" },
];
