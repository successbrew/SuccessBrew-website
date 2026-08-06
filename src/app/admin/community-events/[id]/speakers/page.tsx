import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { eventSpeakerColumns } from "@/lib/admin/schemas/event-speaker";
import { deleteEventSpeaker } from "./actions";

export const dynamic = "force-dynamic";

export default async function EventSpeakersPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();
  const { id } = await params;

  const event = await prisma.communityEvent.findUnique({ where: { id } });
  if (!event) notFound();

  const speakers = await prisma.eventSpeaker.findMany({ where: { eventId: id }, orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/community-events" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Community Events
        </Link>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Speakers — {event.title}</h1>
        <Button asChild>
          <Link href={`/admin/community-events/${id}/speakers/new`}>New Speaker</Link>
        </Button>
      </div>
      <DataTable
        rows={speakers}
        columns={eventSpeakerColumns}
        editHrefBase={`/admin/community-events/${id}/speakers`}
        deleteAction={deleteEventSpeaker.bind(null, id)}
      />
    </div>
  );
}
