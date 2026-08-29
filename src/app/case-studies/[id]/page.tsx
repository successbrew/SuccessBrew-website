import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/queries/content";
import { CaseStudyPageClient } from "@/components/CaseStudyPageClient";

// Cached for 60s, same rationale as the case studies list page.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caseStudy = await prisma.caseStudy.findUnique({ where: { id } }).catch(() => null);
  if (!caseStudy) return {};
  return {
    title: `${caseStudy.title} | Case Study | Successbrew`,
    description: caseStudy.description || caseStudy.problem || "A Successbrew case study",
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [caseStudy, relatedStudies, siteSettings] = await Promise.all([
    prisma.caseStudy.findUnique({ where: { id } }),
    prisma.caseStudy.findMany({
      where: { id: { not: id } },
      orderBy: { order: "asc" },
      take: 3,
    }),
    getSiteSettings().catch(() => ({
      instagramUrl: null,
      instagramUrl2: null,
      linkedinUrl: null,
      youtubeUrl: null,
    })),
  ]);

  if (!caseStudy) notFound();

  return (
    <CaseStudyPageClient
      caseStudy={caseStudy}
      relatedStudies={relatedStudies}
      siteSettings={siteSettings}
    />
  );
}
