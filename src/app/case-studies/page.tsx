import { getCaseStudies, getSiteSettings } from "@/lib/queries/content";
import { CaseStudiesPageClient } from "@/components/CaseStudiesPageClient";

export const revalidate = 0;

export const metadata = {
  title: "Case Studies | Successbrew",
  description: "Real brands, real results. See how Successbrew has helped founders build lasting visibility.",
};

export default async function CaseStudiesPage({
  searchParams,
}: {
  searchParams: Promise<{ cs?: string }>;
}) {
  const [{ cs }, caseStudies, siteSettings] = await Promise.all([
    searchParams,
    getCaseStudies().catch(() => []),
    getSiteSettings().catch(() => ({
      instagramUrl: null,
      linkedinUrl: null,
      youtubeUrl: null,
      twitterUrl: null,
      facebookUrl: null,
    })),
  ]);

  return <CaseStudiesPageClient caseStudies={caseStudies} siteSettings={siteSettings} initialSelectedId={cs} />;
}
