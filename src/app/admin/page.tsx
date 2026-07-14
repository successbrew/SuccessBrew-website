import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await verifyAdminSession();

  const [
    services,
    processSteps,
    caseStudies,
    testimonials,
    stats,
    brandPartners,
    communityEvents,
    podcastEpisodes,
    communityWins,
    communityPosts,
    communityPartners,
    communityMembers,
    blogPosts,
  ] = await Promise.all([
    prisma.service.count(),
    prisma.processStep.count(),
    prisma.caseStudy.count(),
    prisma.testimonial.count(),
    prisma.stat.count(),
    prisma.brandPartner.count({ where: { group: "SERVICES_HOMEPAGE" } }),
    prisma.communityEvent.count(),
    prisma.podcastEpisode.count(),
    prisma.communityWin.count(),
    prisma.communityPost.count(),
    prisma.brandPartner.count({ where: { group: "COMMUNITY_PARTNER" } }),
    prisma.brandPartner.count({ where: { group: "COMMUNITY_MEMBER" } }),
    prisma.blog.count(),
  ]);

  const counts = [
    { label: "Services", value: services },
    { label: "Process Steps", value: processSteps },
    { label: "Case Studies", value: caseStudies },
    { label: "Testimonials", value: testimonials },
    { label: "Stats", value: stats },
    { label: "Brand Partners", value: brandPartners },
    { label: "Community Events", value: communityEvents },
    { label: "Podcast Episodes", value: podcastEpisodes },
    { label: "Community Wins", value: communityWins },
    { label: "Community Posts", value: communityPosts },
    { label: "Community Partners", value: communityPartners },
    { label: "Community Members", value: communityMembers },
    { label: "Blog Posts", value: blogPosts },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Welcome, {admin.name ?? admin.email}</h1>
      <p className="mb-6 text-muted-foreground">Content overview across the site.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {counts.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
