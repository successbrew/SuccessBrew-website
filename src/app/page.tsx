import {
  getServices,
  getProcessSteps,
  getHomepageCaseStudies,
  getHomepageTestimonials,
  getStats,
  getBrandPartners,
  getSiteSettings,
} from "@/lib/queries/content";
import { ServicesPageClient } from "@/components/ServicesPageClient";

export const revalidate = 0;

export default async function ServicesPage() {
  const [services, processSteps, caseStudies, testimonials, stats, brandPartners, siteSettings] = await Promise.all([
    getServices().catch(() => []),
    getProcessSteps().catch(() => []),
    getHomepageCaseStudies().catch(() => []),
    getHomepageTestimonials().catch(() => []),
    getStats().catch(() => []),
    getBrandPartners().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);

  return (
    <ServicesPageClient
      services={services}
      processSteps={processSteps}
      caseStudies={caseStudies}
      testimonials={testimonials}
      stats={stats}
      brandPartners={brandPartners}
      siteSettings={siteSettings}
    />
  );
}
