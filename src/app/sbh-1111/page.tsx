import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/admin/analytics/StatTile";
import { STATUS_LABELS } from "@/lib/services/applications/status-transitions";
import { ApplicationStatus } from "@prisma/client";
import type { PersonalInfo } from "@/lib/types/application";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  admin_invited: "Admin invited",
  admin_roles_updated: "Admin roles updated",
  admin_removed: "Admin removed",
  application_approved: "Application approved",
  application_rejected: "Application rejected",
  speaker_created: "Speaker created",
};

const NEEDS_ATTENTION_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.NEED_MORE_INFO,
  ApplicationStatus.INTERVIEW_SCHEDULED,
  ApplicationStatus.INTERVIEW_COMPLETED,
];

export default async function AdminDashboardPage() {
  const admin = await verifyAdminSession();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    pendingCount,
    newThisMonthCount,
    speakerCount,
    unreadNotificationCount,
    needsAttention,
    recentActivity,
    contentCounts,
  ] = await Promise.all([
    prisma.application.count({ where: { status: { in: NEEDS_ATTENTION_STATUSES } } }),
    prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.speaker.count(),
    prisma.notification.count({ where: { audience: "ADMIN", readAt: null } }),
    prisma.application.findMany({
      where: { status: { in: NEEDS_ATTENTION_STATUSES } },
      orderBy: { submittedAt: "desc" },
      take: 6,
      include: { category: true },
    }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    Promise.all([
      prisma.service.count(),
      prisma.caseStudy.count(),
      prisma.testimonial.count(),
      prisma.communityEvent.count(),
      prisma.podcastEpisode.count(),
      prisma.blog.count(),
    ]),
  ]);

  const [services, caseStudies, testimonials, communityEvents, podcastEpisodes, blogPosts] = contentCounts;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {admin.name ?? admin.email}</h1>
        <p className="text-muted-foreground">Here&rsquo;s what&rsquo;s happening across Successbrew right now.</p>
      </div>

      {/* ── Pipeline at a glance ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Pending review" value={String(pendingCount)} sub="applications awaiting a decision" />
        <StatTile label="New this month" value={String(newThisMonthCount)} sub="applications submitted" />
        <StatTile label="Speakers" value={String(speakerCount)} sub="created from approvals" />
        <StatTile label="Unread notifications" value={String(unreadNotificationCount)} sub="in the admin bell" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Needs attention ──────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Needs Your Attention</CardTitle>
            <Link href="/sbh-1111/applications" className="text-xs font-medium text-primary underline underline-offset-2">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {needsAttention.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing pending — the queue is clear.</p>
            ) : (
              <ul className="divide-y">
                {needsAttention.map((app) => {
                  const personal = app.personal as unknown as PersonalInfo;
                  return (
                    <li key={app.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <Link href={`/sbh-1111/applications/${app.id}`} className="truncate text-sm font-medium hover:underline">
                          {personal.firstName} {personal.lastName}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {app.category?.label ?? "Uncategorized"} · {app.applicationCode}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{STATUS_LABELS[app.status]}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── Recent activity ──────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/sbh-1111/audit-logs" className="text-xs font-medium text-primary underline underline-offset-2">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity logged yet.</p>
            ) : (
              <ul className="divide-y">
                {recentActivity.map((log) => (
                  <li key={log.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm">{ACTION_LABELS[log.action] ?? log.action}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {log.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Content library ─────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Content Library</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Services" value={String(services)} />
          <StatTile label="Case Studies" value={String(caseStudies)} />
          <StatTile label="Testimonials" value={String(testimonials)} />
          <StatTile label="Community Events" value={String(communityEvents)} />
          <StatTile label="Podcast Episodes" value={String(podcastEpisodes)} />
          <StatTile label="Blog Posts" value={String(blogPosts)} />
        </div>
      </div>
    </div>
  );
}
