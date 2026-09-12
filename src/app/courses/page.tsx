import { getSiteSettings } from "@/lib/queries/content";
import { CoursesPageClient } from "@/components/CoursesPageClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content.
export const revalidate = 60;

export default async function CoursesPage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    instagramUrl2: null,
    linkedinUrl: null,
    youtubeUrl: null,
  }));

  return <CoursesPageClient siteSettings={siteSettings} />;
}
