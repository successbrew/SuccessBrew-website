import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { EventPartnersSelector } from "@/components/admin/generic/EventPartnersSelector";
import { communityEventFields } from "@/lib/admin/schemas/community-event";
import { updateCommunityEvent } from "../../actions";
import { updateEventPartners } from "../partners-actions";

export const dynamic = "force-dynamic";

export default async function EditCommunityEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const [communityEvent, allPartners] = await Promise.all([
    prisma.communityEvent.findUnique({ where: { id }, include: { partners: true } }),
    prisma.brandPartner.findMany({ where: { group: "COMMUNITY_PARTNER" }, orderBy: { order: "asc" } }),
  ]);
  if (!communityEvent) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Community Event</h1>
        <Button asChild variant="outline">
          <Link href={`/admin/community-events/${id}/speakers`}>Manage Speakers</Link>
        </Button>
      </div>
      <ContentForm
        fields={communityEventFields}
        defaultValues={{
          ...communityEvent,
          eventDate: communityEvent.eventDate.toISOString().slice(0, 10),
          speaker: communityEvent.speaker ?? undefined,
          imageUrl: communityEvent.imageUrl ?? undefined,
          registerUrl: communityEvent.registerUrl ?? undefined,
          seatsNote: communityEvent.seatsNote ?? undefined,
          subtitle: communityEvent.subtitle ?? undefined,
          timeRange: communityEvent.timeRange ?? undefined,
          priceNote: communityEvent.priceNote ?? undefined,
          audienceNote: communityEvent.audienceNote ?? undefined,
          highlightStatValue: communityEvent.highlightStatValue ?? undefined,
          highlightStatLabel: communityEvent.highlightStatLabel ?? undefined,
          totalSeats: communityEvent.totalSeats ?? undefined,
          agenda: communityEvent.agenda ?? undefined,
          hostName: communityEvent.hostName ?? undefined,
          hostRole: communityEvent.hostRole ?? undefined,
          hostBio: communityEvent.hostBio ?? undefined,
          hostPhotoUrl: communityEvent.hostPhotoUrl ?? undefined,
          venueAddress: communityEvent.venueAddress ?? undefined,
          venuePhotoUrl: communityEvent.venuePhotoUrl ?? undefined,
          benefits: communityEvent.benefits.join("\n"),
          becomePartnerUrl: communityEvent.becomePartnerUrl ?? undefined,
        }}
        action={updateCommunityEvent.bind(null, communityEvent.id)}
        redirectTo="/admin/community-events"
      />

      <div className="mt-10 max-w-xl">
        <h2 className="mb-3 text-lg font-semibold">Community Partners for this Event</h2>
        <EventPartnersSelector
          allPartners={allPartners}
          selectedIds={communityEvent.partners.map((p) => p.id)}
          action={updateEventPartners.bind(null, communityEvent.id)}
        />
      </div>
    </div>
  );
}
