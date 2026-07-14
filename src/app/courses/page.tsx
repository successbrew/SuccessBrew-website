import { getSiteSettings } from "@/lib/queries/content";
import { CoursesPageClient } from "@/components/CoursesPageClient";

export const revalidate = 0;

export default async function CoursesPage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    linkedinUrl: null,
    youtubeUrl: null,
    twitterUrl: null,
    facebookUrl: null,
  }));

  return <CoursesPageClient siteSettings={siteSettings} />;
}
