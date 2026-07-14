import { getCommunityTestimonials, getSiteSettings } from "@/lib/queries/content";
import { CommunityTestimonialsPageClient } from "@/components/CommunityTestimonialsPageClient";

export const revalidate = 0;

export const metadata = {
  title: "Community Stories | Successbrew",
  description: "Real words from the 8,000+ founders, freelancers, and creators inside the Successbrew community.",
};

export default async function CommunityTestimonialsPage() {
  const [testimonials, siteSettings] = await Promise.all([
    getCommunityTestimonials().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, linkedinUrl: null, youtubeUrl: null, twitterUrl: null, facebookUrl: null })),
  ]);

  return <CommunityTestimonialsPageClient testimonials={testimonials} siteSettings={siteSettings} />;
}
