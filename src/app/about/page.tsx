import { getSiteSettings } from "@/lib/queries/content";
import { AboutPageClient } from "@/components/AboutPageClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content.
export const revalidate = 60;

export const metadata = {
  title: "Our Story | Successbrew",
  description: "The Successbrew story — why it started, how it grew from 30 people to 8,000+, and where it is going next.",
};

export default async function AboutPage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    instagramUrl2: null,
    linkedinUrl: null,
    youtubeUrl: null,
  }));

  return <AboutPageClient siteSettings={siteSettings} />;
}
