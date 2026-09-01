/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SectionWave } from "@/components/SectionWave";
import { WordReveal } from "@/components/WordReveal";
import { ScrollAutoplayYouTube } from "@/components/ScrollAutoplayYouTube";
import type { SiteSettings } from "@/components/SocialLinks";
import type { EventPillar } from "@/lib/event-pillars";
import { getSmoothScroll } from "@/components/SmoothScroll";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

/** Height (px) of the fixed main NavBar + the sticky section nav below it —
 * used to offset anchor scrolling so a jumped-to section never lands under them. */
const SCROLL_OFFSET = 140;

export interface EventLandingData {
  id: string;
  title: string;
  tag: string;
  date: string;
  eventDate: string;
  location: string;
  imageUrl: string | null;
  subtitle: string | null;
  timeRange: string | null;
  priceNote: string | null;
  audienceNote: string | null;
  highlightStatValue: string | null;
  highlightStatLabel: string | null;
  totalSeats: number | null;
  remainingSeats: number | null;
  showRemainingSeats: boolean;
  venueAddress: string | null;
  venuePhotoUrl: string | null;
  videoUrl: string | null;
  agenda: string | null;
  hostName: string | null;
  hostRole: string | null;
  hostBio: string | null;
  hostPhotoUrl: string | null;
  registerUrl: string | null;
  seatsNote: string | null;
  benefits: string[];
  becomePartnerUrl: string | null;
  galleryUrls: string[];
  audienceTags: string[];
  faq: string | null;
  speakers: { id: string; name: string; role: string | null; bio: string | null; photoUrl: string | null }[];
  partners: { id: string; name: string; logoUrl: string; websiteUrl: string | null }[];
}

export interface RelatedEvent {
  id: string;
  title: string;
  tag: string;
  date: string;
  eventDate: string;
  location: string;
}

export interface EventTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initial: string;
  avatarUrl: string | null;
}

function firstToken(s: string) {
  return s.split(/[·,]/)[0]?.trim() ?? s;
}

function youtubeVideoId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match?.[1] ?? null;
}

interface AgendaItem { time?: string; title: string; description?: string }

function parseAgenda(raw: string | null): AgendaItem[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 3) return { time: parts[0], title: parts[1], description: parts.slice(2).join(" | ") };
      if (parts.length === 2) return { time: parts[0], title: parts[1] };
      return { title: parts[0] ?? line };
    });
}

interface BenefitItem { title: string; description?: string }

function parseBenefits(list: string[]): BenefitItem[] {
  return list.map((line) => {
    const idx = line.indexOf("|");
    if (idx === -1) return { title: line };
    return { title: line.slice(0, idx).trim(), description: line.slice(idx + 1).trim() };
  });
}

interface FaqItem { question: string; answer: string }

function parseFaq(raw: string | null): FaqItem[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("|");
      if (idx === -1) return null;
      return { question: line.slice(0, idx).trim(), answer: line.slice(idx + 1).trim() };
    })
    .filter((x): x is FaqItem => x !== null);
}

/** Computed "N of Total seats left" line, falling back to the admin's free-text
 * seatsNote override when set, and to a total-only/open-seating line otherwise.
 * Remaining-seat count is only surfaced when the admin has toggled it on. */
function seatsSummary(event: EventLandingData, { totalSuffix, fallback }: { totalSuffix: string; fallback: string }) {
  if (event.seatsNote) return event.seatsNote;
  if (event.totalSeats != null) {
    if (event.showRemainingSeats && event.remainingSeats != null) {
      return `${event.remainingSeats} of ${event.totalSeats} seats left`;
    }
    return `${event.totalSeats} ${totalSuffix}`;
  }
  return fallback;
}

function googleCalendarUrl(event: EventLandingData) {
  const d = new Date(event.eventDate);
  const fmt = (dt: Date) => dt.toISOString().slice(0, 10).replace(/-/g, "");
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${fmt(d)}/${fmt(next)}`,
    location: event.venueAddress || event.location,
    details: event.subtitle || event.tag,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Scrolls through the site's Lenis instance when active (so section-nav jumps
 * don't fight the smooth-scroll engine every other interaction uses), falling
 * back to a native smooth scroll if Lenis hasn't mounted. */
function smoothScrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getSmoothScroll();
  if (lenis) {
    lenis.scrollTo(el, { offset: -SCROLL_OFFSET });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

function useActiveSection(ids: string[]) {
  const key = ids.join(",");
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex-1 rounded-full border border-[#111111]/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[#111111]/70 transition hover:border-[#111111]/30"
    >
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

interface HeroPerson { name: string; role: string | null; photoUrl: string | null; isHost: boolean }

/** Auto-advancing crossfade card for the hero — one speaker/host photo at a
 * time, with click-through dot indicators. Pauses auto-advance for
 * prefers-reduced-motion, but dots stay clickable either way. */
function HeroSpeakerSlideshow({ people }: { people: HeroPerson[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (people.length <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % people.length), 3800);
    return () => clearInterval(id);
  }, [people.length]);

  const person = people[index];
  if (!person) return null;

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl">
      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: E }} className="absolute inset-0">
          {person.photoUrl ? (
            <img src={person.photoUrl} alt={person.name} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[#0037D2]/50 text-6xl font-black text-white/40">
              {person.name.charAt(0)}
            </div>
          )}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <span className="inline-block rounded-full bg-[#C1FF3B] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#111111]">
              {person.isHost ? "Host" : "Speaker"}
            </span>
            <p className="mt-3 text-2xl font-black leading-tight text-white">{person.name}</p>
            {person.role && <p className="mt-1 text-sm font-semibold text-[#C1FF3B]">{person.role}</p>}
          </div>
        </motion.div>
      </AnimatePresence>
      {people.length > 1 && (
        <div className="absolute right-5 top-5 z-10 flex gap-1.5">
          {people.map((_, i) => (
            <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Show ${people[i].name}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Sticky in-page jump nav — only lists sections the event actually has data
 * for, so a sparse event (hero + agenda + location only, say) shows a short
 * nav instead of dead links. */
function SectionNav({
  items,
  activeId,
  registerHref,
  hasRegisterUrl,
}: {
  items: { id: string; label: string }[];
  activeId: string | null;
  registerHref: string;
  hasRegisterUrl: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="sticky top-20 z-30 border-b border-[#111111]/8 bg-[#F2ECDD]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 lg:px-10">
        <div className="hide-scrollbar flex grow items-center gap-1 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => smoothScrollToId(item.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                activeId === item.id
                  ? "bg-[#111111] text-white"
                  : "text-[#111111]/55 hover:bg-[#111111]/6 hover:text-[#111111]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <a
          href={registerHref}
          target={hasRegisterUrl ? "_blank" : undefined}
          rel="noreferrer noopener"
          className="ml-2 hidden shrink-0 items-center gap-1.5 rounded-full bg-[#C1FF3B] px-4 py-1.5 text-xs font-bold text-[#111111] transition hover:translate-y-[-1px] sm:inline-flex"
        >
          Register
        </a>
      </div>
    </div>
  );
}

function FaqRow({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#111111]/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-base font-black text-[#111111] sm:text-lg">{item.question}</span>
        <span
          aria-hidden
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#111111]/15 text-lg leading-none text-[#111111]/60 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-5 pr-10 text-sm leading-relaxed text-[#111111]/65">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

const GALLERY_PATTERN = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
];

export function EventLandingPageClient({
  pillar,
  event,
  relatedEvents,
  siteSettings,
  testimonials,
}: {
  pillar: EventPillar;
  event: EventLandingData;
  relatedEvents: RelatedEvent[];
  siteSettings: SiteSettings;
  testimonials: EventTestimonial[];
}) {
  const agendaItems = useMemo(() => parseAgenda(event.agenda), [event.agenda]);
  const benefitItems = useMemo(() => parseBenefits(event.benefits), [event.benefits]);
  const faqItems = useMemo(() => parseFaq(event.faq), [event.faq]);
  const venue = event.venueAddress || event.location;
  const registerHref = event.registerUrl ?? "#registration";
  const hasTimedAgenda = agendaItems.some((a) => a.time);
  const heroDate = new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
  const videoId = youtubeVideoId(event.videoUrl);
  const hasSpeakerSection = event.speakers.length > 0 || !!event.hostName;
  const hasAudienceSection = !!event.audienceNote || event.audienceTags.length > 0;
  const heroPeople = useMemo<HeroPerson[]>(() => {
    const list: HeroPerson[] = event.speakers.map((s) => ({ name: s.name, role: s.role, photoUrl: s.photoUrl, isHost: false }));
    if (event.hostName) list.push({ name: event.hostName, role: event.hostRole, photoUrl: event.hostPhotoUrl, isHost: true });
    return list;
  }, [event.speakers, event.hostName, event.hostRole, event.hostPhotoUrl]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const navItems = useMemo(
    () =>
      [
        { id: "overview", label: "Overview", show: true },
        { id: "highlights", label: "Highlights", show: benefitItems.length > 0 },
        { id: "gallery", label: "Gallery", show: event.galleryUrls.length >= 2 },
        { id: "speakers", label: "Speakers", show: hasSpeakerSection },
        { id: "schedule", label: "Schedule", show: agendaItems.length > 0 },
        { id: "audience", label: "Who's In The Room", show: hasAudienceSection },
        { id: "location", label: "Location", show: !!venue },
        { id: "voices", label: "Voices", show: testimonials.length > 0 },
        { id: "faq", label: "FAQ", show: faqItems.length > 0 },
      ].filter((i) => i.show),
    [benefitItems.length, event.galleryUrls.length, hasSpeakerSection, agendaItems.length, hasAudienceSection, venue, testimonials.length, faqItems.length]
  );
  const activeId = useActiveSection(navItems.map((i) => i.id));

  return (
    <>
      <NavBar activePage="Community" ctaText="Join Community" ctaHref="/apply?source=community" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO — cinematic, bottom-anchored ═══════════════════════════ */}
        <section className="relative flex min-h-[86vh] flex-col justify-end overflow-hidden bg-[#0037D2] pb-16 pt-32 text-white lg:min-h-[92vh] lg:pb-20 lg:pt-40">
          {event.imageUrl ? (
            <>
              {/* Cover images here are typically pre-designed banners with their own
                  title/date text baked in, not plain photography — heavy blur turns
                  them into a color/mood wash so they never compete with the real,
                  crisp title rendered on top. */}
              <div
                aria-hidden
                className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
                style={{ backgroundImage: `url(${event.imageUrl})` }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0037D2] via-[#0037D2]/45 to-[#0037D2]/80"
              />
            </>
          ) : (
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/10" />
              <div className="absolute left-[-100px] bottom-[-120px] h-[300px] w-[300px] rounded-full bg-[#C1FF3B]/10 blur-3xl" />
            </div>
          )}

          {/* Speaker slideshow — vertically centered on the right, independent of
              the bottom-anchored text below, so it reads as part of the backdrop
              rather than sharing the text's baseline. Desktop only; a compact
              in-flow version above the text covers mobile. */}
          {heroPeople.length > 0 && (
            <div className="pointer-events-none absolute inset-y-0 right-6 z-[1] hidden w-[440px] items-center justify-center lg:right-10 lg:flex xl:right-16 xl:w-[500px]">
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: E }}
                className="pointer-events-auto w-full max-w-[380px] px-8 xl:max-w-[420px]">
                <HeroSpeakerSlideshow people={heroPeople} />
              </motion.div>
            </div>
          )}

          <div className="relative mx-auto w-full max-w-5xl px-6 lg:px-10 lg:pr-[420px] xl:pr-[480px]">
            {heroPeople.length > 0 && (
              <div className="mx-auto mb-10 w-full max-w-[220px] sm:max-w-[260px] lg:hidden">
                <HeroSpeakerSlideshow people={heroPeople} />
              </div>
            )}

            <motion.div initial="hidden" animate="visible" variants={stagger(0.11)} className="max-w-2xl">
              <motion.a variants={fadeUp} href={`/community/events/${pillar.slug}`}
                className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 hover:text-white">
                ← Back to {pillar.title}
              </motion.a>

              <motion.div variants={fadeUp} className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#C1FF3B] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#111111]">
                  {event.tag}
                </span>
                <span className="rounded-full border border-white/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
                  {firstToken(event.location)}
                </span>
                {event.priceNote && (
                  <span className="rounded-full border border-white/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
                    {event.priceNote}
                  </span>
                )}
              </motion.div>

              <motion.p variants={fadeUp} className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">
                Successbrew Events · {heroDate}
              </motion.p>

              <h1 className="text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-black leading-[0.94] tracking-tight text-white">
                <WordReveal text={event.title} mode="nested" staggerDelay={0.06} />
              </h1>

              {event.subtitle && (
                <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-white/70 sm:text-xl">
                  {event.subtitle}
                </motion.p>
              )}

              {/* Date/time/location/seats live once, in the quick-facts card right
                  below the hero — repeating them here as a second list was pure
                  duplication. */}
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <a href={registerHref} target={event.registerUrl ? "_blank" : undefined} rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-sm font-bold text-[#111111] transition hover:translate-y-[-2px]">
                  Save my seat <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </a>
                {navItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => smoothScrollToId(navItems[0].id)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Explore the experience <ArrowDown className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══ QUICK FACTS ═══════════════════════════════════════════════ */}
        <div className="relative z-10 mx-auto -mt-10 max-w-5xl px-6 lg:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp}
            className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-white p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.35)] lg:p-8">
            <div className="grid grow grid-cols-2 gap-6 sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Date</p>
                <p className="mt-1 text-sm font-bold text-[#111111]">{event.date}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Time</p>
                <p className="mt-1 text-sm font-bold text-[#111111]">{event.timeRange ?? "TBA"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Where</p>
                <p className="mt-1 truncate text-sm font-bold text-[#111111]">{event.location}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Seats</p>
                <p className="mt-1 truncate text-sm font-bold text-[#0037D2]">
                  {seatsSummary(event, { totalSuffix: "seats", fallback: "Open seating" })}
                </p>
              </div>
            </div>
            <a href={registerHref} target={event.registerUrl ? "_blank" : undefined} rel="noreferrer noopener"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#C1FF3B] px-7 py-3.5 text-sm font-bold text-[#111111] transition hover:translate-y-[-2px]">
              Save my seat →
            </a>
          </motion.div>
        </div>

        {/* ══ STICKY SECTION NAV ═══════════════════════════════════════════ */}
        <SectionNav items={navItems} activeId={activeId} registerHref={registerHref} hasRegisterUrl={!!event.registerUrl} />

        {/* ══ OVERVIEW ═══════════════════════════════════════════════════ */}
        <section id="overview" className="scroll-mt-36 bg-[#F2ECDD] py-16 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}>
              <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">
                {pillar.icon} About {pillar.title}
              </motion.p>
              <motion.h2 variants={fadeUp} className="mt-4 text-balance text-3xl font-black leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]">
                {pillar.tagline}
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-relaxed text-[#111111]/65 sm:text-lg">
                {pillar.description}
              </motion.p>
            </motion.div>

            {event.subtitle && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                className="relative rounded-2xl bg-white p-8 lg:mt-2">
                <span aria-hidden className="absolute left-0 top-8 h-10 w-1 rounded-full bg-[#C1FF3B]" />
                <p className="pl-5 text-lg font-bold leading-snug text-[#111111] sm:text-xl">
                  {event.subtitle}
                </p>
                <p className="pl-5 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#111111]/40">
                  This edition — {event.title}
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* ══ HIGHLIGHTS ═══════════════════════════════════════════════════ */}
        {benefitItems.length > 0 && (
          <section id="highlights" className="scroll-mt-36 bg-[#F2ECDD] pb-16 lg:pb-24">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-10 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">The Experience</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">What you walk away with.</h2>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {benefitItems.map((b, i) => (
                  <motion.div key={i} variants={fadeUp} className="rounded-2xl bg-white p-6 transition hover:-translate-y-1">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0037D2] text-xs font-black text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 text-lg font-black leading-snug text-[#111111]">{b.title}</h3>
                    {b.description && <p className="mt-2 text-sm leading-relaxed text-[#111111]/60">{b.description}</p>}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ RECAP VIDEO ══════════════════════════════════════════════════ */}
        {videoId && (
          <section className="bg-[#F2ECDD] pb-16 lg:pb-24">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-8 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">The Recap</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">Watch how it went down.</h2>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#111111] shadow-[0_24px_60px_-32px_rgba(0,0,0,0.35)]">
                <ScrollAutoplayYouTube videoId={videoId} title={`${event.title} recap`} className="h-full w-full" />
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ VISUAL GALLERY ═══════════════════════════════════════════════ */}
        {event.galleryUrls.length >= 2 && (
          <section id="gallery" className="scroll-mt-36 bg-white py-16 lg:py-24">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-10 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">The Room</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">What it actually feels like.</h2>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.06)}
                className="grid grid-cols-2 auto-rows-[150px] gap-3 sm:auto-rows-[180px] md:grid-cols-4 md:auto-rows-[210px] md:gap-4">
                {event.galleryUrls.map((url, i) => (
                  <motion.div key={url + i} variants={fadeUp}
                    className={`group relative overflow-hidden rounded-2xl bg-[#111111]/5 ${GALLERY_PATTERN[i % GALLERY_PATTERN.length]}`}>
                    <img src={url} alt={`${event.title} — photo ${i + 1}`} loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ SPEAKERS ═══════════════════════════════════════════════════ */}
        {hasSpeakerSection && (
          <section id="speakers" className="scroll-mt-36 bg-[#F2ECDD] py-16 lg:py-24">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-10 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">On the Mic</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">Who you&rsquo;ll hear from.</h2>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {event.speakers.map((s) => (
                  <motion.div key={s.id} variants={fadeUp}>
                    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#0037D2]/10">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt={s.name} loading="lazy"
                          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-4xl font-black text-[#0037D2]/25">
                          {s.name.charAt(0)}
                        </div>
                      )}
                      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-[#C1FF3B] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#111111]">
                        Speaker
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-base font-black text-white">{s.name}</p>
                        {s.role && <p className="mt-0.5 text-xs font-semibold text-[#C1FF3B]">{s.role}</p>}
                      </div>
                    </div>
                    {s.bio && <p className="mt-3 text-xs leading-relaxed text-[#111111]/55">{s.bio}</p>}
                  </motion.div>
                ))}
                {event.hostName && (
                  <motion.div variants={fadeUp}>
                    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#0037D2]/10">
                      {event.hostPhotoUrl ? (
                        <img src={event.hostPhotoUrl} alt={event.hostName} loading="lazy"
                          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-4xl font-black text-[#0037D2]/25">
                          {event.hostName.charAt(0)}
                        </div>
                      )}
                      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#0037D2]">
                        Host
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-base font-black text-white">{event.hostName}</p>
                        {event.hostRole && <p className="mt-0.5 text-xs font-semibold text-[#C1FF3B]">{event.hostRole}</p>}
                      </div>
                    </div>
                    {event.hostBio && <p className="mt-3 text-xs leading-relaxed text-[#111111]/55">{event.hostBio}</p>}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ SCHEDULE ═══════════════════════════════════════════════════ */}
        {agendaItems.length > 0 && (
          <section id="schedule" className="scroll-mt-36 bg-white py-16 lg:py-24">
            <div className="mx-auto max-w-4xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Run of Show</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">The agenda.</h2>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.06)}
                className="relative border-l-2 border-[#111111]/10 pl-7 sm:pl-9">
                {agendaItems.map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="relative pb-10 last:pb-0">
                    <span aria-hidden className="absolute -left-[33px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[#0037D2] ring-4 ring-white sm:-left-[37px]" />
                    {hasTimedAgenda && item.time && (
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0037D2]">{item.time}</p>
                    )}
                    <h3 className="mt-1 text-lg font-black text-[#111111] sm:text-xl">{item.title}</h3>
                    {item.description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#111111]/60">{item.description}</p>}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ WHO SHOULD ATTEND ═══════════════════════════════════════════ */}
        {hasAudienceSection && (
          <section id="audience" className="scroll-mt-36 bg-[#F0EBD8] py-16 lg:py-24">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#111111]/50">Who&rsquo;s in the Room</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">Built for the room, not the crowd.</h2>
              </motion.div>
              {event.audienceNote && (
                <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                  className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#111111]/70 sm:text-lg">
                  {event.audienceNote}
                </motion.p>
              )}
              {event.audienceTags.length > 0 && (
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.05)}
                  className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {event.audienceTags.map((t, i) => (
                    <motion.span key={i} variants={fadeUp}
                      className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#111111] shadow-sm">
                      {t}
                    </motion.span>
                  ))}
                </motion.div>
              )}
              {(event.totalSeats || event.highlightStatValue) && (
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                  className="mt-10 flex flex-wrap items-center justify-center gap-10">
                  {event.totalSeats && (
                    <div>
                      <p className="text-3xl font-black text-[#0037D2]">{event.totalSeats}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#111111]/50">Seats</p>
                    </div>
                  )}
                  {event.highlightStatValue && (
                    <div>
                      <p className="text-3xl font-black text-[#0037D2]">{event.highlightStatValue}</p>
                      <p className="mt-1 max-w-[10rem] text-[10px] font-bold uppercase tracking-[0.12em] text-[#111111]/50">{event.highlightStatLabel}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* ══ LOCATION ═══════════════════════════════════════════════════ */}
        {venue && (
          <section id="location" className="scroll-mt-36 bg-[#F2ECDD] py-16 lg:py-24">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-10 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Getting There</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">Find the room.</h2>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                className={`grid gap-6 ${event.venuePhotoUrl ? "lg:grid-cols-2" : ""}`}>
                {event.venuePhotoUrl && (
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto">
                    <img src={event.venuePhotoUrl} alt={event.location} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="rounded-2xl bg-white p-6 lg:p-8">
                  <p className="text-lg font-black text-[#111111]">{event.location}</p>
                  {event.venueAddress && <p className="mt-1 text-sm text-[#111111]/60">{event.venueAddress}</p>}
                  <div className="mt-5 aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#F0EBD8]">
                    <iframe
                      title={`Map to ${event.location}`}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(venue)}&output=embed`}
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="mt-5 flex gap-3">
                    <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer noopener"
                      className="flex-1 rounded-full bg-[#111111] px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#0037D2]">
                      Add to calendar
                    </a>
                    <ShareButton title={event.title} />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ VOICES / SOCIAL PROOF ═══════════════════════════════════════ */}
        {testimonials.length > 0 && (
          <section id="voices" className="scroll-mt-36 bg-white py-16 lg:py-24">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-10 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Community Voices</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">People who&rsquo;ve been in the room.</h2>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
                className="grid gap-6 sm:grid-cols-3">
                {testimonials.slice(0, 3).map((t) => (
                  <motion.div key={t.id} variants={fadeUp} className="flex h-full flex-col rounded-2xl bg-[#F2ECDD] p-6">
                    <p className="line-clamp-5 text-sm leading-relaxed text-[#111111]/75">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-auto flex items-center gap-3 pt-5">
                      {t.avatarUrl ? (
                        <img src={t.avatarUrl} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0037D2] text-sm font-black text-white">
                          {t.initial}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-black text-[#111111]">{t.name}</p>
                        <p className="text-xs text-[#111111]/50">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ FAQ ═══════════════════════════════════════════════════════ */}
        {faqItems.length > 0 && (
          <section id="faq" className="scroll-mt-36 bg-[#F2ECDD] py-16 lg:py-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Good to Know</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">Frequently asked.</h2>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                className="rounded-2xl bg-white px-6 sm:px-8">
                {faqItems.map((item, i) => (
                  <FaqRow key={i} item={item} isOpen={openFaqIndex === i} onToggle={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} />
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ FINAL CTA ═══════════════════════════════════════════════════ */}
        <section id="registration" className="scroll-mt-24 bg-[#111111] py-20 text-white lg:py-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}
            className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">
              {event.priceNote ?? "Reserve your seat"}
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 text-balance text-4xl font-black tracking-tight md:text-5xl">
              Ready to be in the room?
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-white/60">
              {seatsSummary(event, { totalSuffix: "seats total", fallback: "Limited seating" })}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <a href={registerHref} target={event.registerUrl ? "_blank" : undefined} rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
                Save my seat <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
              {!event.registerUrl && (
                <p className="mt-4 text-xs text-white/45">Registration link coming soon — check back shortly.</p>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* ══ RELATED EVENTS ═══════════════════════════════════════════════ */}
        {relatedEvents.length > 0 && (
          <section className="bg-[#F2ECDD] py-16 lg:py-20">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                className="mb-8 flex items-end justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight md:text-3xl">Can&rsquo;t make this one?</h2>
                <a href={`/community/events/${pillar.slug}`} className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#0037D2] hover:underline">
                  All events →
                </a>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
                className="grid gap-5 sm:grid-cols-3">
                {relatedEvents.map((r) => (
                  <motion.a key={r.id} variants={fadeUp} href={`/community/events/${pillar.slug}/${r.id}`}
                    className="group block rounded-2xl bg-white p-6 transition hover:-translate-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#0037D2]">{r.tag} · {r.date}</p>
                    <p className="mt-2 text-base font-black text-[#111111] group-hover:text-[#0037D2]">{r.title}</p>
                    <span className="mt-3 inline-block text-xs font-semibold text-[#111111]/40 group-hover:text-[#0037D2]">View event →</span>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ BECOME A PARTNER ═════════════════════════════════════════ */}
        {event.becomePartnerUrl && (
          <>
            <SectionWave from="#F2ECDD" to="#0037D2" />
            <section className="bg-[#0037D2] py-20 text-white lg:py-28">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}
                className="mx-auto max-w-2xl px-6 text-center lg:px-10">
                <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">Sponsor this room</motion.p>
                <motion.h2 variants={fadeUp} className="mt-4 text-balance text-4xl font-black tracking-tight md:text-5xl">Become a Partner.</motion.h2>
                <motion.div variants={fadeUp} className="mt-8">
                  <a href={event.becomePartnerUrl} target="_blank" rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
                    Become a Partner
                  </a>
                </motion.div>
              </motion.div>
            </section>
            <SectionWave from="#0037D2" to="#F2ECDD" />
          </>
        )}

        {/* ══ PARTNERS ══════════════════════════════════════════════════ */}
        {event.partners.length > 0 && (
          <section className="bg-[#F2ECDD] py-16 lg:py-20">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#111111]/40">Partners</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                {event.partners.map((p) => {
                  const logo = (
                    <img
                      src={p.logoUrl}
                      alt={p.name}
                      className="h-9 w-auto object-contain grayscale transition hover:grayscale-0"
                    />
                  );
                  return p.websiteUrl ? (
                    <a key={p.id} href={p.websiteUrl} target="_blank" rel="noreferrer noopener" aria-label={p.name}>
                      {logo}
                    </a>
                  ) : (
                    <span key={p.id}>{logo}</span>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
