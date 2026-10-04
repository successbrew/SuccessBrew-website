import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries/content";
import { FounderProfilePageClient } from "@/components/FounderProfilePageClient";
import { FOUNDER } from "@/lib/content/about";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `${FOUNDER.name} — Founder | Successbrew`,
  description: FOUNDER.intro,
};

export default async function FounderProfilePage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    instagramUrl2: null,
    linkedinUrl: null,
    youtubeUrl: null,
  }));

  return <FounderProfilePageClient siteSettings={siteSettings} />;
}
