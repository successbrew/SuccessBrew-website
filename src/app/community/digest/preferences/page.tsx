import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/queries/content";
import { DigestPreferencesClient } from "@/components/DigestPreferencesClient";

export const revalidate = 0;

export const metadata = {
  title: "Manage Your Daily Brief | Successbrew",
  description: "Pick the topics you want covered in your daily Successbrew digest.",
};

export default async function DigestPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  const [topics, siteSettings] = await Promise.all([
    prisma.digestTopic.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);

  return (
    <DigestPreferencesClient
      siteSettings={siteSettings}
      topics={topics.map((t) => ({ id: t.id, title: t.title }))}
      initialEmail={email ?? ""}
    />
  );
}
