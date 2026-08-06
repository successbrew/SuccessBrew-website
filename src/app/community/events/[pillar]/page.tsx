import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/queries/content";
import { CommunityEventsPageClient } from "@/components/CommunityEventsPageClient";
import { EVENT_PILLARS, getEventPillarBySlug } from "@/lib/event-pillars";

export const revalidate = 0;

export function generateStaticParams() {
  return EVENT_PILLARS.map((p) => ({ pillar: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar: slug } = await params;
  const pillar = getEventPillarBySlug(slug);
  if (!pillar) return {};
  return {
    title: `${pillar.title} | Successbrew Community`,
    description: pillar.description,
  };
}

export default async function EventPillarPage({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar: slug } = await params;
  const pillar = getEventPillarBySlug(slug);
  if (!pillar) notFound();

  const [rows, siteSettings] = await Promise.all([
    prisma.communityEvent
      .findMany({ where: { category: pillar.category }, orderBy: { eventDate: "desc" } })
      .catch(() => []),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);

  const events = rows.map((e) => ({
    _id: e.id,
    tag: e.tag,
    title: e.title,
    date: e.date,
    eventDate: e.eventDate.toISOString(),
    category: e.category,
    location: e.location,
    speaker: e.speaker ?? undefined,
    registerUrl: e.registerUrl ?? undefined,
    seatsNote: e.seatsNote ?? undefined,
    isFeatured: e.isFeatured,
    imageUrl: e.imageUrl ?? "",
    agenda: e.agenda ?? undefined,
  }));

  // Server Component: runs once per request (revalidate = 0), not a client re-render,
  // so reading the current time here is safe and keeps SSR/hydration in sync.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  return <CommunityEventsPageClient events={events} siteSettings={siteSettings} now={now} pillar={pillar} />;
}
