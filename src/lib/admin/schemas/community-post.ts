import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { CommunityPost } from "@prisma/client";

export const communityPostSchema = z.object({
  order: z.coerce.number().int().default(0),
  name: z.string().min(1, "Required"),
  role: z.string().min(1, "Required"),
  initial: z.string().min(1, "Required"),
  avatarStyle: z.enum(["BLUE", "DARK"]),
  tag: z.string().min(1, "Required"),
  tagStyle: z.enum(["LIME", "DARK", "LIGHT_BLUE"]),
  content: z.string().min(1, "Required"),
  likes: z.coerce.number().int().default(0),
  comments: z.coerce.number().int().default(0),
  timeAgo: z.string().min(1).default("1d ago"),
});

export type CommunityPostInput = z.infer<typeof communityPostSchema>;

export const communityPostFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "name", label: "Name", type: "text" },
  { name: "role", label: "Role", type: "text" },
  { name: "initial", label: "Avatar Initial", type: "text", placeholder: "single letter" },
  {
    name: "avatarStyle",
    label: "Avatar Style",
    type: "select",
    options: [
      { value: "BLUE", label: "Blue" },
      { value: "DARK", label: "Dark" },
    ],
  },
  { name: "tag", label: "Tag", type: "text", placeholder: "Funding, Launch, Job Win, Milestone" },
  {
    name: "tagStyle",
    label: "Tag Style",
    type: "select",
    options: [
      { value: "LIME", label: "Lime" },
      { value: "DARK", label: "Dark" },
      { value: "LIGHT_BLUE", label: "Light Blue" },
    ],
  },
  { name: "content", label: "Content", type: "textarea" },
  { name: "likes", label: "Likes", type: "number" },
  { name: "comments", label: "Comments", type: "number" },
  { name: "timeAgo", label: "Time Ago", type: "text", placeholder: "2h ago" },
];

export const communityPostColumns: ColumnConfig<CommunityPost>[] = [
  { key: "order", label: "Order" },
  { key: "name", label: "Name" },
  { key: "tag", label: "Tag" },
];
