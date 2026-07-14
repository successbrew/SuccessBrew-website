import { getServiceTestimonials, getSiteSettings } from "@/lib/queries/content";
import { TestimonialsPageClient } from "@/components/TestimonialsPageClient";

export const revalidate = 0;

export const metadata = {
  title: "Founder Testimonials | Successbrew",
  description: "Real words from real founders who've worked with Successbrew.",
};

export default async function TestimonialsPage() {
  const [testimonials, siteSettings] = await Promise.all([
    getServiceTestimonials().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, linkedinUrl: null, youtubeUrl: null, twitterUrl: null, facebookUrl: null })),
  ]);

  return <TestimonialsPageClient testimonials={testimonials} siteSettings={siteSettings} />;
}
