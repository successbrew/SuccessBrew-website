import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { communityEventFields } from "@/lib/admin/schemas/community-event";
import { updateCommunityEvent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCommunityEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const communityEvent = await prisma.communityEvent.findUnique({ where: { id } });
  if (!communityEvent) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Community Event</h1>
      <ContentForm
        fields={communityEventFields}
        defaultValues={{
          ...communityEvent,
          eventDate: communityEvent.eventDate.toISOString().slice(0, 10),
          speaker: communityEvent.speaker ?? undefined,
          imageUrl: communityEvent.imageUrl ?? undefined,
          registerUrl: communityEvent.registerUrl ?? undefined,
          seatsNote: communityEvent.seatsNote ?? undefined,
        }}
        action={updateCommunityEvent.bind(null, communityEvent.id)}
        redirectTo="/admin/community-events"
      />
    </div>
  );
}
