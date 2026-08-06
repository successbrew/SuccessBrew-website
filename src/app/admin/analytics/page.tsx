import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { ApplicationStatus } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatTile } from "@/components/admin/analytics/StatTile";
import { BarList } from "@/components/admin/analytics/BarList";
import { TrendChart } from "@/components/admin/analytics/TrendChart";
import type { PersonalInfo, ProfessionalInfo } from "@/lib/types/application";

export const dynamic = "force-dynamic";

function topN(counts: Record<string, number>, n: number) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, value]) => ({ label, value }));
}

export default async function AnalyticsPage() {
  await requirePermission(PERMISSIONS.ANALYTICS_VIEW);

  const [applications, speakerCount, categoryApplications, decisionHistory] = await Promise.all([
    prisma.application.findMany({
      where: { status: { not: ApplicationStatus.DRAFT } },
      select: { personal: true, professional: true, status: true, submittedAt: true, createdAt: true },
    }),
    prisma.speaker.count(),
    prisma.application.findMany({
      where: { status: { not: ApplicationStatus.DRAFT }, categoryId: { not: null } },
      select: { category: { select: { label: true } } },
    }),
    prisma.statusHistory.findMany({
      where: { toStatus: { in: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED] } },
      select: { applicationId: true, toStatus: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const total = applications.length;
  const approvedStatuses: ApplicationStatus[] = [
    ApplicationStatus.APPROVED,
    ApplicationStatus.SPEAKER_CREATED,
    ApplicationStatus.PODCAST_SCHEDULED,
    ApplicationStatus.RECORDING_COMPLETED,
    ApplicationStatus.EDITING,
    ApplicationStatus.PUBLISHED,
  ];
  const approved = applications.filter((a) => approvedStatuses.includes(a.status)).length;
  const rejected = applications.filter((a) => a.status === ApplicationStatus.REJECTED).length;

  // Average review time: first APPROVED/REJECTED decision minus submission date, per application.
  const firstDecisionByApp = new Map<string, Date>();
  for (const entry of decisionHistory) {
    if (!firstDecisionByApp.has(entry.applicationId)) firstDecisionByApp.set(entry.applicationId, entry.createdAt);
  }
  const appsWithSubmittedAt = await prisma.application.findMany({
    where: { id: { in: [...firstDecisionByApp.keys()] } },
    select: { id: true, submittedAt: true },
  });
  const reviewDurationsMs = appsWithSubmittedAt
    .map((a) => {
      const decidedAt = firstDecisionByApp.get(a.id);
      return a.submittedAt && decidedAt ? decidedAt.getTime() - a.submittedAt.getTime() : null;
    })
    .filter((ms): ms is number => ms !== null && ms >= 0);
  const avgReviewDays =
    reviewDurationsMs.length > 0
      ? (reviewDurationsMs.reduce((sum, ms) => sum + ms, 0) / reviewDurationsMs.length / (1000 * 60 * 60 * 24)).toFixed(1)
      : null;

  const categoryCounts: Record<string, number> = {};
  for (const app of categoryApplications) {
    if (app.category) categoryCounts[app.category.label] = (categoryCounts[app.category.label] ?? 0) + 1;
  }

  const cityCounts: Record<string, number> = {};
  const industryCounts: Record<string, number> = {};
  for (const app of applications) {
    const personal = app.personal as unknown as PersonalInfo;
    const professional = app.professional as unknown as ProfessionalInfo;
    if (personal?.city) cityCounts[personal.city] = (cityCounts[personal.city] ?? 0) + 1;
    if (professional?.industry) industryCounts[professional.industry] = (industryCounts[professional.industry] ?? 0) + 1;
  }

  // Monthly growth: last 6 months, counted by createdAt.
  const now = new Date();
  const months: { label: string; key: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString("en-US", { month: "short" }), key: `${d.getFullYear()}-${d.getMonth()}`, value: 0 });
  }
  for (const app of applications) {
    const d = app.createdAt;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.value += 1;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">Speaker pipeline performance at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Total applications" value={String(total)} />
        <StatTile label="Approval rate" value={total > 0 ? `${Math.round((approved / total) * 100)}%` : "—"} sub={`${approved} approved`} />
        <StatTile label="Rejection rate" value={total > 0 ? `${Math.round((rejected / total) * 100)}%` : "—"} sub={`${rejected} rejected`} />
        <StatTile label="Avg. review time" value={avgReviewDays ? `${avgReviewDays}d` : "—"} sub="submission to decision" />
        <StatTile label="Speaker conversion" value={total > 0 ? `${Math.round((speakerCount / total) * 100)}%` : "—"} sub={`${speakerCount} speakers created`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart points={months.map((m) => ({ label: m.label, value: m.value }))} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList items={topN(categoryCounts, 6)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList items={topN(cityCounts, 6)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Industries</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList items={topN(industryCounts, 6)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
