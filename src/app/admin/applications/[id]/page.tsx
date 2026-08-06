import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApplicationStatusActions } from "@/components/admin/applications/ApplicationStatusActions";
import { ApplicationReviewForm } from "@/components/admin/applications/ApplicationReviewForm";
import { CreateSpeakerButton } from "@/components/admin/applications/CreateSpeakerButton";
import { DeleteApplicationDialog } from "@/components/admin/applications/DeleteApplicationDialog";
import { legalNextStatuses, STATUS_LABELS } from "@/lib/services/applications/status-transitions";
import { ApplicationStatus } from "@prisma/client";
import { changeApplicationStatus, addApplicationReview, createSpeakerAction, deleteApplicationAction } from "./actions";
import type { PersonalInfo, ProfessionalInfo } from "@/lib/types/application";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value || value === 0 ? value : "—"}</p>
    </div>
  );
}

function LinkField({ label, url }: { label: string; url?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer noopener" className="mt-0.5 block truncate text-sm text-primary underline underline-offset-2">
          {url}
        </a>
      ) : (
        <p className="mt-0.5 text-sm">—</p>
      )}
    </div>
  );
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePermission(PERMISSIONS.APPLICATIONS_REVIEW);
  const { id } = await params;

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      category: true,
      subCategory: true,
      documents: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
      speaker: true,
      _count: { select: { activityLogs: true } },
    },
  });
  if (!app) notFound();

  const personal = app.personal as unknown as PersonalInfo;
  const professional = app.professional as unknown as ProfessionalInfo;
  const socials = professional?.socials;

  const canApprove = hasPermission(admin.roles, PERMISSIONS.APPLICATIONS_APPROVE);
  // SPEAKER_CREATED is never a bare status flip — it only happens via the dedicated
  // "Create Speaker" action below, which also assigns the ID and sends emails.
  const statusOptions = legalNextStatuses(app.status).filter(
    (s) =>
      s !== ApplicationStatus.SPEAKER_CREATED &&
      (canApprove || (s !== ApplicationStatus.APPROVED && s !== ApplicationStatus.REJECTED))
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/applications" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Applications
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{personal.firstName} {personal.lastName}</h1>
          <p className="text-sm text-muted-foreground">{app.applicationCode}</p>
        </div>
        <Badge variant="secondary" className="text-sm">{STATUS_LABELS[app.status]}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ApplicationStatusActions applicationId={app.id} options={statusOptions} action={changeApplicationStatus} />
          {app.speaker ? (
            <p className="text-sm text-muted-foreground">
              Speaker created: <span className="font-semibold text-foreground">{app.speaker.speakerCode}</span>
            </p>
          ) : (
            app.status === ApplicationStatus.APPROVED &&
            canApprove && <CreateSpeakerButton applicationId={app.id} action={createSpeakerAction} />
          )}

          {canApprove && (
            <div className="border-t pt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Danger Zone</p>
              {app.speaker ? (
                <p className="text-sm text-muted-foreground">
                  This applicant has a public Speaker profile — remove or unpublish it at{" "}
                  <Link href={`/admin/speakers/${app.speaker.id}`} className="text-primary underline underline-offset-2">
                    /admin/speakers
                  </Link>{" "}
                  before this application can be deleted.
                </p>
              ) : (
                <DeleteApplicationDialog
                  applicationId={app.id}
                  applicantName={`${personal.firstName} ${personal.lastName}`}
                  applicationCode={app.applicationCode}
                  counts={{
                    documents: app.documents.length,
                    reviews: app.reviews.length,
                    statusHistory: app.statusHistory.length,
                    activityLog: app._count.activityLogs,
                  }}
                  action={deleteApplicationAction}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="First Name" value={personal.firstName} />
            <Field label="Last Name" value={personal.lastName} />
            <Field label="Email" value={personal.email} />
            <Field label="Phone" value={personal.phone} />
            <Field label="Country" value={personal.country} />
            <Field label="City" value={personal.city} />
            <Field label="Birthday" value={personal.birthday} />
            <Field label="Gender" value={personal.gender} />
            {personal.headshotUrl && (
              <div className="col-span-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Headshot</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={personal.headshotUrl} alt="Headshot" className="h-32 w-32 rounded-lg object-cover" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Major Category" value={app.category?.label} />
            <Field label="Sub Category" value={app.subCategory?.label} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Company" value={professional?.companyName} />
            <Field label="Role" value={professional?.currentRole} />
            <Field label="Years of Experience" value={professional?.yearsExperience} />
            <LinkField label="Company Website" url={professional?.companyWebsite} />
            <Field label="Industry" value={professional?.industry} />
            <Field label="Revenue" value={professional?.revenue} />
            <Field label="Funding Stage" value={professional?.fundingStage} />
            <Field label="Team Size" value={professional?.teamSize} />
            <Field label="Community Size" value={professional?.communitySize} />
            <Field label="Speaking Experience" value={professional?.speakingExperience} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Online Presence</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <LinkField label="LinkedIn" url={socials?.linkedin} />
            <LinkField label="Instagram" url={socials?.instagram} />
            <LinkField label="Twitter / X" url={socials?.twitter} />
            <LinkField label="YouTube" url={socials?.youtube} />
            <LinkField label="Website" url={socials?.website} />
            <LinkField label="Portfolio" url={socials?.portfolio} />
            <Field label="Previous Podcasts" value={socials?.podcastLinks?.join(", ")} />
            <Field label="Articles" value={socials?.articles?.join(", ")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {app.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            ) : (
              <ul className="space-y-2">
                {app.documents.map((doc) => (
                  <li key={doc.id}>
                    <a href={doc.url} target="_blank" rel="noreferrer noopener" className="text-sm text-primary underline underline-offset-2">
                      {doc.kind}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {app.statusHistory.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <span className="font-medium">{STATUS_LABELS[entry.toStatus]}</span>
                  <span className="text-muted-foreground"> — {entry.createdAt.toISOString().slice(0, 19).replace("T", " ")}</span>
                  {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Notes & Review History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ApplicationReviewForm applicationId={app.id} action={addApplicationReview} />
            {app.reviews.length > 0 && (
              <ul className="space-y-3 border-t pt-4">
                {app.reviews.map((review) => (
                  <li key={review.id} className="text-sm">
                    {review.score != null && <span className="font-medium">Score: {review.score}/5 · </span>}
                    <span className="text-muted-foreground">{review.createdAt.toISOString().slice(0, 19).replace("T", " ")}</span>
                    {review.notes && <p className="mt-0.5">{review.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
