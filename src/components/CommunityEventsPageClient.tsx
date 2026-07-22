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
}

interface Props {
  events: EventItem[];
  siteSettings: SiteSettings;
  now: number;
}

function EventTile({ event, when }: { event: EventItem; when: "upcoming" | "past" }) {
  return (
    <motion.a
      variants={cardUp}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: E } }}
      href={event.registerUrl ?? "#"}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#111111]/5 bg-white shadow-[0_8px_24px_-16px_rgba(0,0,0,0.15)] transition-shadow hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#111111]/5">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-[#111111]/20">
            <span className="text-4xl">📅</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${when === "past" ? "bg-[#111111]/70 text-white" : "bg-[#C1FF3B] text-[#111111]"}`}>
          {when === "past" ? "Past" : "Upcoming"}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#0037D2]">
          {eventCategoryLabel(event.category)}
        </span>
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
        {when === "upcoming" && (
          <span className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-[#111111] group-hover:text-[#0037D2]">
            Register now →
          </span>
        )}
      </div>
    </motion.a>
  );
}

export function CommunityEventsPageClient({ events, siteSettings, now }: Props) {
  const [category, setCategory] = useState<string>("ALL");

  const filtered = category === "ALL" ? events : events.filter((e) => e.category === category);

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

  return (
    <>
      <NavBar activePage="Community" ctaText="Join Community" ctaHref="/community#cta" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#F2ECDD] pt-32 pb-16 lg:pt-44 lg:pb-24">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-[#0037D2]/15 blur-3xl" />
            <div className="absolute right-[-100px] bottom-0 h-[380px] w-[380px] rounded-full bg-[#C1FF3B]/30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.11)}>
              <motion.a variants={fadeUp} href="/community"
                className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]/50 hover:text-[#0037D2]">
                ← Back to Community
              </motion.a>
              <motion.div variants={fadeUp}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0037D2]" />
                {events.length} event{events.length !== 1 ? "s" : ""} and counting
              </motion.div>

              <h1 className="text-balance text-[clamp(2.75rem,7vw,6rem)] font-black leading-[0.95] tracking-tight text-[#111111]">
                <WordReveal text="Every room" mode="nested" staggerDelay={0.06} />
                {" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#0037D2]"><WordReveal text="we've filled." mode="nested" staggerDelay={0.06} /></span>
                  <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-[#C1FF3B] md:h-6" />
                </span>
              </h1>

              <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg text-[#111111]/60 md:text-xl">
                Summits, workshops, demo days and retreats — what&rsquo;s coming up, and everything we&rsquo;ve already brewed.
              </motion.p>
            </motion.div>
          </div>
        </section>
        <SectionWave from="#F2ECDD" to="#F0EBD8" />

        {/* ══ CATEGORY FILTER ═══════════════════════════════════════════ */}
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

        {/* ══ UPCOMING ══════════════════════════════════════════════════ */}
        <section className="bg-[#F0EBD8] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
              className="mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Upcoming</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">What&rsquo;s next</h2>
            </motion.div>

            <AnimatePresence mode="wait">
              {upcoming.length > 0 ? (
                <motion.div key={`up-${category}`} initial="hidden" animate="visible" variants={stagger(0.08)}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((ev) => <EventTile key={ev._id} event={ev} when="upcoming" />)}
                </motion.div>
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
              <a href="/community#cta" className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
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
