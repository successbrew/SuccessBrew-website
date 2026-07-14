import { z } from "zod";
import type { FieldConfig, ColumnConfig } from "@/lib/admin/field-types";
import type { BrandPartner } from "@prisma/client";

export const brandPartnerSchema = z.object({
  order: z.coerce.number().int().default(0),
  name: z.string().min(1, "Required"),
  logoUrl: z.string().min(1, "Logo URL is required"),
  websiteUrl: z.string().optional(),
  group: z.enum(["SERVICES_HOMEPAGE", "COMMUNITY_PARTNER", "COMMUNITY_MEMBER"]).default("SERVICES_HOMEPAGE"),
});

export type BrandPartnerInput = z.infer<typeof brandPartnerSchema>;

export const brandPartnerFields: FieldConfig[] = [
  { name: "order", label: "Order", type: "number" },
  { name: "name", label: "Brand Name", type: "text" },
  { name: "logoUrl", label: "Logo URL", type: "image", required: true },
  { name: "websiteUrl", label: "Website URL (optional)", type: "url" },
  {
    name: "group",
    label: "Show In",
    type: "select",
    options: [
      { value: "SERVICES_HOMEPAGE", label: "Services Page — Trusted By" },
      { value: "COMMUNITY_PARTNER", label: "Community Page — Community Partners" },
      { value: "COMMUNITY_MEMBER", label: "Community Page — Community Members" },
    ],
  },
];

export const brandPartnerColumns: ColumnConfig<BrandPartner>[] = [
  { key: "order", label: "Order" },
  { key: "name", label: "Brand Name" },
  { key: "group", label: "Show In" },
];
