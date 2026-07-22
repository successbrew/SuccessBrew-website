import { getSiteSettings } from "@/lib/queries/content";
import { CoursesPageClient } from "@/components/CoursesPageClient";

export const revalidate = 0;

export default async function CoursesPage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    instagramUrl2: null,
    linkedinUrl: null,
    youtubeUrl: null,
  }));

  return <CoursesPageClient siteSettings={siteSettings} />;
}
