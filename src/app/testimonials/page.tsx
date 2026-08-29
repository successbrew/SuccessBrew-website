import { getServiceTestimonials, getSiteSettings } from "@/lib/queries/content";
import { TestimonialsPageClient } from "@/components/TestimonialsPageClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content, unlike the rest
// of the site which stays fully dynamic.
export const revalidate = 60;

export const metadata = {
  title: "Founder Testimonials | Successbrew",
  description: "Real words from real founders who've worked with Successbrew.",
};

export default async function TestimonialsPage() {
  const [testimonials, siteSettings] = await Promise.all([
    getServiceTestimonials().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);

  return <TestimonialsPageClient testimonials={testimonials} siteSettings={siteSettings} />;
}
