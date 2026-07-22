import { getSiteSettings } from "@/lib/queries/content";
import { AboutPageClient } from "@/components/AboutPageClient";

export const revalidate = 0;

export const metadata = {
  title: "About | Successbrew",
  description: "The story behind Successbrew — our mission, our journey, and the people building India's startup ecosystem.",
};

export default async function AboutPage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    instagramUrl2: null,
    linkedinUrl: null,
    youtubeUrl: null,
  }));

  return <AboutPageClient siteSettings={siteSettings} />;
}
