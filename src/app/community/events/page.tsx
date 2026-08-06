import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/queries/content";
import { CommunityEventsPageClient } from "@/components/CommunityEventsPageClient";

export const revalidate = 0;

export const metadata = {
  title: "All Events | Successbrew",
  description: "Every Successbrew summit, workshop and meetup — upcoming and past — across India.",
};

export default async function CommunityEventsPage() {
  const [rows, siteSettings] = await Promise.all([
    prisma.communityEvent.findMany({ orderBy: { eventDate: "desc" } }).catch(() => []),
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
  return <CommunityEventsPageClient events={events} siteSettings={siteSettings} now={now} />;
}
