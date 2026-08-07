/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import type { SiteSettings } from "@/components/SocialLinks";
import { WordReveal } from "@/components/WordReveal";
import { SectionWave } from "@/components/SectionWave";
import { EVENT_CATEGORIES, eventCategoryLabel } from "@/lib/event-categories";
import { getEventPillarByCategory, type EventPillar } from "@/lib/event-pillars";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } } };
const cardUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

export interface EventItem {
  _id: string;
  tag: string;
  title: string;
  date: string;
  eventDate: string;
  category: string;
  location: string;
  speaker?: string;
  registerUrl?: string;
  seatsNote?: string;
  isFeatured: boolean;
  imageUrl: string;
  agenda?: string;
}

interface Props {
  events: EventItem[];
  siteSettings: SiteSettings;
  now: number;
  /** When set, this page is scoped to a single event pillar (e.g. /community/events/d2c-round-table):
   * events are already pre-filtered server-side, the category filter bar is hidden, and the hero
   * uses the pillar's own copy instead of the generic "all events" copy. */
  pillar?: EventPillar;
}

function EventTile({ event, when }: { event: EventItem; when: "upcoming" | "past" }) {
  const pillar = getEventPillarByCategory(event.category);
  const href = pillar ? `/community/events/${pillar.slug}/${event._id}` : (event.registerUrl ?? "#");
  const d = new Date(event.eventDate);
  const day = d.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();

  return (
    <motion.a
      variants={cardUp}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: E } }}
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#111111]/5 bg-white shadow-[0_8px_24px_-16px_rgba(0,0,0,0.15)] transition-shadow hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0037D2]/10">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-[#0037D2]/25">
            <span className="text-4xl">📅</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0037D2]">
          {eventCategoryLabel(event.category)}
        </span>
        {when === "upcoming" ? (
          <span className="absolute right-3 top-3 flex flex-col items-center rounded-lg bg-white px-2 py-1 leading-none shadow-sm">
            <span className="text-sm font-black text-[#111111]">{day}</span>
            <span className="text-[9px] font-bold uppercase text-[#0037D2]">{month}</span>
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full bg-[#111111]/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
            Past
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xs font-bold text-white/80">{event.date}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#0037D2]">{event.tag}</span>
          <h3 className="mt-1 text-lg font-black leading-snug text-[#111111]">{event.title}</h3>
          <p className="mt-2 text-xs text-[#111111]/50">📍 {event.location}{event.speaker ? ` · 👤 ${event.speaker}` : ""}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          {when === "upcoming" && event.seatsNote ? (
            <span className="text-xs font-bold text-[#0037D2]">{event.seatsNote}</span>
          ) : <span />}
          <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${when === "upcoming" ? "bg-[#111111] text-white group-hover:bg-[#0037D2]" : "border border-[#111111]/15 text-[#111111]/70"}`}>
            {when === "past" ? "View recap" : pillar ? "View details" : "Register"}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function NextUpCard({ event }: { event: EventItem }) {
  const pillar = getEventPillarByCategory(event.category);
  const href = pillar ? `/community/events/${pillar.slug}/${event._id}` : (event.registerUrl ?? "#");
  const bullets = (event.agenda ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
      className="overflow-hidden rounded-[2rem] border border-[#111111]/5 bg-white shadow-[0_24px_60px_-32px_rgba(0,0,0,0.3)]"
    >
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0037D2] lg:aspect-auto">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full min-h-[220px] w-full place-items-center text-white/20">
              <span className="text-5xl">📅</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0037D2]/60 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#C1FF3B] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#111111]">Next Up</span>
            {event.isFeatured && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur">Featured</span>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 lg:p-10">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-black leading-tight text-[#111111]">{event.title}</h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#111111]/40">{event.location}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b border-[#111111]/10 pb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Date</p>
              <p className="mt-1 text-sm font-bold text-[#111111]">{event.date}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Location</p>
              <p className="mt-1 truncate text-sm font-bold text-[#111111]">{event.location}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Seats</p>
              <p className="mt-1 truncate text-sm font-bold text-[#0037D2]">{event.seatsNote ?? "Open"}</p>
            </div>
          </div>

          {bullets.length > 0 && (
            <ul className="mt-6 space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#111111]/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0037D2]" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={href} className="inline-flex items-center gap-2 rounded-full bg-[#0037D2] px-6 py-3 text-sm font-bold text-white transition hover:translate-y-[-2px]">
              Save my seat →
            </a>
            {pillar && (
              <a href={href} className="inline-flex items-center gap-2 rounded-full border border-[#111111]/15 px-6 py-3 text-sm font-semibold text-[#111111]/70 transition hover:border-[#111111]/30">
                Full agenda
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CommunityEventsPageClient({ events, siteSettings, now, pillar }: Props) {
  const [category, setCategory] = useState<string>("ALL");

  // Pillar-scoped pages already receive category-filtered events from the server.
  const filtered = pillar || category === "ALL" ? events : events.filter((e) => e.category === category);

  const { upcoming, past } = useMemo(() => {
    const up = filtered.filter((e) => new Date(e.eventDate).getTime() >= now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    const past = filtered.filter((e) => new Date(e.eventDate).getTime() < now)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    return { upcoming: up, past };
  }, [filtered, now]);

  const categoriesWithCounts = EVENT_CATEGORIES.map((c) => ({
    ...c,
    count: events.filter((e) => e.category === c.value).length,
  })).filter((c) => c.count > 0);

  const stats = useMemo(() => {
    const cities = new Set(events.map((e) => e.location.split(/[·,]/)[0].trim().toLowerCase()).filter(Boolean)).size;
    return [
      { value: `${events.length}+`, label: "Events hosted" },
      { value: "8,000+", label: "Founders in the room" },
      { value: `${cities || 1}`, label: "Cities on the map" },
      { value: "Free", label: "For community members" },
    ];
  }, [events]);

  const [nextUp, ...restUpcoming] = upcoming;

  return (
    <>
      <NavBar activePage="Community" ctaText="Join Community" ctaHref="/apply" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#0037D2] pt-32 pb-16 text-white lg:pt-44 lg:pb-24">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full border border-white/10" />
            <div className="absolute right-[-140px] top-[-40px] h-[380px] w-[380px] rounded-full border border-white/10" />
            <div className="absolute left-[-100px] bottom-[-120px] h-[340px] w-[340px] rounded-full bg-[#C1FF3B]/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.11)}>
              <motion.a variants={fadeUp} href={pillar ? "/community/events" : "/community"}
                className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 hover:text-white">
                ← Back to {pillar ? "All Events" : "Community"}
              </motion.a>
              <motion.p variants={fadeUp} className="mb-6 text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">
                {pillar ? `${pillar.icon} ${pillar.tagline}` : "Successbrew Events · 2026 Season"}
              </motion.p>

              {pillar ? (
                <h1 className="text-balance text-[clamp(2.75rem,7vw,6rem)] font-black leading-[0.95] tracking-tight text-white">
                  <WordReveal text={pillar.title} mode="nested" staggerDelay={0.06} />
                </h1>
              ) : (
                <h1 className="text-balance text-[clamp(2.75rem,7vw,6rem)] font-black leading-[0.95] tracking-tight text-white">
                  <WordReveal text="Rooms where founders" mode="nested" staggerDelay={0.06} />
                  {" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-[#C1FF3B]"><WordReveal text="get found." mode="nested" staggerDelay={0.06} /></span>
                  </span>
                </h1>
              )}

              <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg text-white/70 md:text-xl">
                {pillar ? pillar.description : "Summits, workshops, demo days and retreats — what’s coming up, and everything we’ve already brewed."}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <a href="#upcoming" className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
                  See what&rsquo;s next →
                </a>
                <a href="/community" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                  Explore Community
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══ STATS BAR ═════════════════════════════════════════════════ */}
        <section className="bg-[#00269c]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-6 py-8 lg:grid-cols-4 lg:px-10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-[#C1FF3B] md:text-3xl">{s.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
        <SectionWave from="#00269c" to="#F0EBD8" />

        {/* ══ CATEGORY FILTER (hidden on pillar-scoped pages — already single-category) ══ */}
        {!pillar && (
          <section className="bg-[#F0EBD8] pt-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setCategory("ALL")}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category === "ALL" ? "border-[#0037D2] bg-[#0037D2] text-white" : "border-[#111111]/15 bg-white text-[#111111]/70 hover:border-[#111111]/30"}`}>
                  All Events
                </button>
                {categoriesWithCounts.map((c) => (
                  <button key={c.value} onClick={() => setCategory(c.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category === c.value ? "border-[#0037D2] bg-[#0037D2] text-white" : "border-[#111111]/15 bg-white text-[#111111]/70 hover:border-[#111111]/30"}`}>
                    {c.label} <span className="opacity-50">({c.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ UPCOMING ══════════════════════════════════════════════════ */}
        <section id="upcoming" className="scroll-mt-24 bg-[#F0EBD8] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
              className="mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Upcoming</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">What&rsquo;s next</h2>
            </motion.div>

            <AnimatePresence mode="wait">
              {upcoming.length > 0 ? (
                <div key={`up-${category}`} className="space-y-8">
                  {nextUp && <NextUpCard event={nextUp} />}
                  {restUpcoming.length > 0 && (
                    <motion.div initial="hidden" animate="visible" variants={stagger(0.08)}
                      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {restUpcoming.map((ev) => <EventTile key={ev._id} event={ev} when="upcoming" />)}
                    </motion.div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#111111]/50">No upcoming events in this category yet — check back soon.</p>
              )}
            </AnimatePresence>
          </div>
        </section>
        <SectionWave from="#F0EBD8" to="#F2ECDD" />

        {/* ══ PAST ══════════════════════════════════════════════════════ */}
        <section className="bg-[#F2ECDD] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
              className="mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Past Events</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Everything we&rsquo;ve already brewed</h2>
            </motion.div>

            <AnimatePresence mode="wait">
              {past.length > 0 ? (
                <motion.div key={`past-${category}`} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.06)}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((ev) => <EventTile key={ev._id} event={ev} when="past" />)}
                </motion.div>
              ) : (
                <p className="text-sm text-[#111111]/50">No past events recorded in this category yet.</p>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <SectionWave from="#F2ECDD" to="#0037D2" />
        <section id="cta" className="bg-[#0037D2] py-24 text-white lg:py-32">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger(0.12)}
            className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">Don&rsquo;t miss the next one</motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 text-balance text-4xl font-black tracking-tight md:text-6xl">Be in the room next time.</motion.h2>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href="/apply" className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
                Join Community
              </a>
              <a href="/community" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                Explore Ecosystem
              </a>
            </motion.div>
          </motion.div>
        </section>
        <SectionWave from="#0037D2" to="var(--ink)" />

        <Footer siteSettings={siteSettings} />

      </main>
    </>
  );
}
