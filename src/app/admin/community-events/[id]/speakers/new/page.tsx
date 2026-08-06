import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { eventSpeakerFields } from "@/lib/admin/schemas/event-speaker";
import { createEventSpeaker } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewEventSpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();
  const { id } = await params;

  const event = await prisma.communityEvent.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Speaker — {event.title}</h1>
      <ContentForm
        fields={eventSpeakerFields}
        defaultValues={{ order: 0, name: "", role: "", bio: "", photoUrl: "" }}
        action={createEventSpeaker.bind(null, id)}
        redirectTo={`/admin/community-events/${id}/speakers`}
      />
    </div>
  );
}
