import { getCaseStudies, getSiteSettings } from "@/lib/queries/content";
import { CaseStudiesPageClient } from "@/components/CaseStudiesPageClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content, unlike the rest
// of the site which stays fully dynamic.
export const revalidate = 60;

export const metadata = {
  title: "Case Studies | Successbrew",
  description: "Real brands, real results. See how Successbrew has helped founders build lasting visibility.",
};

export default async function CaseStudiesPage() {
  const [caseStudies, siteSettings] = await Promise.all([
    getCaseStudies().catch(() => []),
    getSiteSettings().catch(() => ({
      instagramUrl: null,
      instagramUrl2: null,
      linkedinUrl: null,
      youtubeUrl: null,
    })),
  ]);

  return <CaseStudiesPageClient caseStudies={caseStudies} siteSettings={siteSettings} />;
}
