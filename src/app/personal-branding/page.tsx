import type { Metadata } from "next";
import { getCaseStudies, getServiceTestimonials, getBrandPartners, getSiteSettings } from "@/lib/queries/content";
import { FounderBrandingPageClient } from "@/components/FounderBrandingPageClient";

export const metadata: Metadata = {
  title: "Founder Led Growth | Personal Branding | Successbrew",
  description:
    "How you position yourself is how the world sees you. Successbrew turns founder expertise into authority, visibility and opportunity.",
};

export const revalidate = 60;

export default async function PersonalBrandingPage() {
  const [caseStudies, testimonials, brandPartners, siteSettings] = await Promise.all([
    getCaseStudies().catch(() => []),
    getServiceTestimonials().catch(() => []),
    getBrandPartners().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);

  return (
    <FounderBrandingPageClient
      caseStudies={caseStudies}
      testimonials={testimonials}
      brandPartners={brandPartners}
      siteSettings={siteSettings}
    />
  );
}
