import { getCaseStudies, getSiteSettings } from "@/lib/queries/content";
import { CaseStudiesPageClient } from "@/components/CaseStudiesPageClient";

export const revalidate = 0;

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
