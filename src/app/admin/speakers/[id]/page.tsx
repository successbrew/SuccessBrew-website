import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { SpeakerNoteForm } from "@/components/admin/speakers/SpeakerNoteForm";
import { speakerProfileFields } from "@/lib/admin/schemas/speaker";
import { updateSpeakerProfile, addSpeakerNote } from "../actions";

export const dynamic = "force-dynamic";

export default async function SpeakerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.SPEAKERS_MANAGE);
  const { id } = await params;

  const speaker = await prisma.speaker.findUnique({
    where: { id },
    include: { application: true, notes: { orderBy: { createdAt: "desc" } } },
  });
  if (!speaker) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/speakers" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Speakers
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{speaker.displayName}</h1>
          <p className="text-sm text-muted-foreground">{speaker.speakerCode}</p>
        </div>
        <Link href={`/admin/applications/${speaker.applicationId}`} className="text-sm text-primary underline underline-offset-2">
          View original application
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentForm
              fields={speakerProfileFields}
              defaultValues={{
                isPublic: speaker.isPublic,
                photoUrl: speaker.photoUrl ?? undefined,
                bio: speaker.bio ?? undefined,
                topics: speaker.topics,
                achievements: speaker.achievements ?? undefined,
              }}
              action={updateSpeakerProfile.bind(null, speaker.id)}
              redirectTo={`/admin/speakers/${speaker.id}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Notes (CRM)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <SpeakerNoteForm speakerId={speaker.id} action={addSpeakerNote} />
            {speaker.notes.length > 0 && (
              <ul className="space-y-3 border-t pt-4">
                {speaker.notes.map((note) => (
                  <li key={note.id} className="text-sm">
                    <span className="text-muted-foreground">{note.createdAt.toISOString().slice(0, 19).replace("T", " ")}</span>
                    <p className="mt-0.5">{note.note}</p>
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
