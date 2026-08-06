import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { eventSpeakerFields } from "@/lib/admin/schemas/event-speaker";
import { updateEventSpeaker } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditEventSpeakerPage({
  params,
}: {
  params: Promise<{ id: string; speakerId: string }>;
}) {
  await verifyAdminSession();
  const { id, speakerId } = await params;

  const speaker = await prisma.eventSpeaker.findUnique({ where: { id: speakerId } });
  if (!speaker || speaker.eventId !== id) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Speaker</h1>
      <ContentForm
        fields={eventSpeakerFields}
        defaultValues={{
          order: speaker.order,
          name: speaker.name,
          role: speaker.role ?? undefined,
          bio: speaker.bio ?? undefined,
          photoUrl: speaker.photoUrl ?? undefined,
        }}
        action={updateEventSpeaker.bind(null, id, speaker.id)}
        redirectTo={`/sbh-1111/community-events/${id}/speakers`}
      />
    </div>
  );
}
