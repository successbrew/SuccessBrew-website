import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, getCommunityTestimonials } from "@/lib/queries/content";
import { getEventPillarBySlug } from "@/lib/event-pillars";
import { EventLandingPageClient } from "@/components/EventLandingPageClient";

// Cached for 60s (admin edits still show instantly via revalidatePath in
// the admin action) — read-heavy, rarely-changing content.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await prisma.communityEvent.findUnique({ where: { id: eventId } }).catch(() => null);
  if (!event) return {};
  return {
    title: `${event.title} | Successbrew Community`,
    description: event.tag,
  };
}

export default async function EventLandingPage({
  params,
}: {
  params: Promise<{ pillar: string; eventId: string }>;
}) {
  const { pillar: pillarSlug, eventId } = await params;
  const pillar = getEventPillarBySlug(pillarSlug);
  if (!pillar) notFound();

  const [event, siteSettings, testimonials] = await Promise.all([
    prisma.communityEvent.findUnique({
      where: { id: eventId },
      include: { speakers: { orderBy: { order: "asc" } }, partners: { orderBy: { order: "asc" } } },
    }),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
    getCommunityTestimonials().catch(() => []),
  ]);

  if (!event || event.category !== pillar.category) notFound();

  const relatedEvents = await prisma.communityEvent
    .findMany({
      where: { category: pillar.category, id: { not: event.id }, eventDate: { gte: new Date() } },
      orderBy: { eventDate: "asc" },
      take: 3,
    })
    .catch(() => []);

  return (
    <EventLandingPageClient
      pillar={pillar}
      event={{
        id: event.id,
        title: event.title,
        tag: event.tag,
        date: event.date,
        eventDate: event.eventDate.toISOString(),
        location: event.location,
        imageUrl: event.imageUrl,
        subtitle: event.subtitle,
        timeRange: event.timeRange,
        priceNote: event.priceNote,
        audienceNote: event.audienceNote,
        highlightStatValue: event.highlightStatValue,
        highlightStatLabel: event.highlightStatLabel,
        totalSeats: event.totalSeats,
        remainingSeats: event.remainingSeats,
        showRemainingSeats: event.showRemainingSeats,
        venueAddress: event.venueAddress,
        venuePhotoUrl: event.venuePhotoUrl,
        videoUrl: event.videoUrl,
        agenda: event.agenda,
        hostName: event.hostName,
        hostRole: event.hostRole,
        hostBio: event.hostBio,
        hostPhotoUrl: event.hostPhotoUrl,
        registerUrl: event.registerUrl,
        seatsNote: event.seatsNote,
        benefits: event.benefits,
        becomePartnerUrl: event.becomePartnerUrl,
        galleryUrls: event.galleryUrls,
        audienceTags: event.audienceTags,
        faq: event.faq,
        speakers: event.speakers.map((s) => ({ id: s.id, name: s.name, role: s.role, bio: s.bio, photoUrl: s.photoUrl })),
        partners: event.partners.map((p) => ({ id: p.id, name: p.name, logoUrl: p.logoUrl, websiteUrl: p.websiteUrl })),
      }}
      relatedEvents={relatedEvents.map((e) => ({
        id: e.id,
        title: e.title,
        tag: e.tag,
        date: e.date,
        eventDate: e.eventDate.toISOString(),
        location: e.location,
      }))}
      siteSettings={siteSettings}
      testimonials={testimonials.map((t) => ({
        id: t._id,
        quote: t.quote,
        name: t.name,
        role: t.role,
        initial: t.initial,
        avatarUrl: t.avatarUrl,
      }))}
    />
  );
}
