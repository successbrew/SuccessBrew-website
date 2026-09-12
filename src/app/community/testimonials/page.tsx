import { getCommunityTestimonials, getSiteSettings } from "@/lib/queries/content";
import { CommunityTestimonialsPageClient } from "@/components/CommunityTestimonialsPageClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content.
export const revalidate = 60;

export const metadata = {
  title: "Community Stories | Successbrew",
  description: "Real words from the 8,000+ founders, freelancers, and creators inside the Successbrew community.",
};

export default async function CommunityTestimonialsPage() {
  const [testimonials, siteSettings] = await Promise.all([
    getCommunityTestimonials().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);

  return <CommunityTestimonialsPageClient testimonials={testimonials} siteSettings={siteSettings} />;
}
