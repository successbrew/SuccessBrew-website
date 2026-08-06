import { auth } from "@/lib/auth/server";
import { getApplicationCategories, getSiteSettings } from "@/lib/queries/content";
import { ApplyWizardClient } from "@/components/apply/ApplyWizardClient";

export const revalidate = 0;

export const metadata = {
  title: "Apply as a Speaker | Successbrew",
  description: "Apply to join Successbrew as a speaker, founder, or creator.",
};

export default async function ApplyPage() {
  const [categories, siteSettings, { data: session }] = await Promise.all([
    getApplicationCategories().catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
    auth.getSession(),
  ]);

  return (
    <ApplyWizardClient
      categories={categories}
      userEmail={session?.user?.email ?? null}
      siteSettings={siteSettings}
    />
  );
}
