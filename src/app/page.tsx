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

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content.
export const revalidate = 60;

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
