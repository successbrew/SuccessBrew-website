/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import type { SiteSettings } from "@/components/SocialLinks";
import { WordReveal } from "@/components/WordReveal";
import { eventCategoryLabel } from "@/lib/event-categories";
import { EVENT_PILLARS, getEventPillarByCategory, type EventPillar } from "@/lib/event-pillars";
import { RoomMotif, roomTheme } from "@/components/community/rooms";
import { Countdown } from "@/components/community/Countdown";
import { DepartureBoard, type BoardRow } from "@/components/events/DepartureBoard";
import { ProgrammeList, type ProgrammeItem } from "@/components/events/ProgrammeList";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } } };
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
   * events are already pre-filtered server-side, the room picker is hidden, and the hero
   * wears that room's theme instead of the season-wide one. */
  pillar?: EventPillar;
}

// Short names that fit a split-flap "room" column.
const BOARD_ROOM: Record<string, string> = {
  "revenue-room": "REVENUE",
  "d2c-round-table": "D2C",
  "tech-integrate": "TECH",
  "wellness-retreats": "RETREAT",
};

function city(location: string) {
  return location.split(/[·,]/)[0]?.trim() || location;
}

function eventHref(e: EventItem) {
  const p = getEventPillarByCategory(e.category);
  return p ? `/community/events/${p.slug}/${e._id}` : (e.registerUrl ?? "#");
}

function toItem(e: EventItem, upcoming: boolean): ProgrammeItem {
  const p = getEventPillarByCategory(e.category);
  return {
    id: e._id,
    href: eventHref(e),
    external: !p && !!e.registerUrl,
    title: e.title,
    tag: e.tag,
    eventDate: e.eventDate,
    city: city(e.location),
    room: p ? { label: p.title, swatch: roomTheme(p.slug).surface } : { label: eventCategoryLabel(e.category), swatch: "bg-[#111111]/25" },
    imageUrl: e.imageUrl,
    note: upcoming ? e.seatsNote : undefined,
  };
}

function boardRow(e: EventItem, status: string, live: boolean): BoardRow {
  const p = getEventPillarByCategory(e.category);
  const d = new Date(e.eventDate);
  return {
    key: e._id,
    href: eventHref(e),
    date: `${d.toLocaleDateString("en-IN", { day: "2-digit" })} ${d.toLocaleDateString("en-IN", { month: "short" })}`,
    room: p ? BOARD_ROOM[p.slug] ?? p.title : eventCategoryLabel(e.category).split(" ")[0],
    title: e.title,
    city: city(e.location),
    status,
    live,
  };
}

/** Room picker on the season page: the four posters as filter switches. The
 * chosen room lifts and plays its motif; the rest step back. */
function RoomPicker({ value, onChange, counts }: { value: string; onChange: (v: string) => void; counts: Record<string, number> }) {
  const reduced = useReducedMotion();
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {EVENT_PILLARS.map((p, i) => {
        const theme = roomTheme(p.slug);
        const on = value === p.category;
        const dim = value !== "ALL" && !on;
        const light = theme.tone === "light";
        return (
          <motion.div key={p.slug}
            initial={reduced ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: E }}>
            <motion.div animate={{ y: on ? -14 : 0, opacity: dim ? 0.45 : 1, scale: dim ? 0.97 : 1 }} transition={{ duration: 0.45, ease: E }}
              className={`group relative aspect-[3/4] overflow-hidden rounded-2xl ${theme.surface} ${on ? "ring-2 ring-[#C6FF3A] ring-offset-4 ring-offset-[#111111]" : ""}`}>
              <RoomMotif slug={p.slug} play={on} loop={on} />
              <button type="button" onClick={() => onChange(on ? "ALL" : p.category)} aria-pressed={on}
                className="absolute inset-0 z-10 flex flex-col justify-between p-4 text-left sm:p-5">
                <span className={`flex w-full justify-between text-[10px] font-semibold uppercase tracking-[0.12em] ${light ? "text-white/65" : "text-[#111111]/50"}`}>
                  <span>{theme.code}</span><span>{counts[p.category] ?? 0} event{(counts[p.category] ?? 0) === 1 ? "" : "s"}</span>
                </span>
                <span>
                  <span className={`block text-balance text-lg font-black uppercase leading-[0.95] sm:text-2xl ${light ? "text-white" : "text-[#111111]"}`}>{p.title}</span>
                  <span className={`mt-2 block text-xs font-medium ${light ? "text-white/65" : "text-[#111111]/55"}`}>{on ? "Showing this room · tap to clear" : p.tagline}</span>
                </span>
              </button>
              <a href={`/community/events/${p.slug}`}
                className={`absolute right-3 top-9 z-20 grid h-9 w-9 place-items-center rounded-full transition sm:right-4 ${light ? "bg-white/15 text-white hover:bg-[#C6FF3A] hover:text-[#111111]" : "bg-[#111111]/10 text-[#111111] hover:bg-[#111111] hover:text-white"}`}
                aria-label={`Enter ${p.title}`}>
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Next event, given a whole band: the poster crisp in a frame beside the
 * countdown and the one action that matters. */
function NextUp({ event }: { event: EventItem }) {
  const p = getEventPillarByCategory(event.category);
  const href = eventHref(event);
  return (
    <section className="bg-[#F2ECDD] pt-16 lg:pt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
          className="grid items-center gap-10 rounded-[2rem] bg-[#111111] p-6 text-white sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:p-14">
          <motion.div variants={fadeUp} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#1A1A1A]">
            {event.imageUrl ? (
              <>
                <div aria-hidden className="absolute inset-0 scale-125 bg-cover bg-center opacity-50 blur-2xl" style={{ backgroundImage: `url(${event.imageUrl})` }} />
                <img src={event.imageUrl} alt={event.title} className="relative h-full w-full object-contain" />
              </>
            ) : p ? (
              <div className={`absolute inset-0 ${roomTheme(p.slug).surface}`}><RoomMotif slug={p.slug} play /></div>
            ) : null}
          </motion.div>
          <div>
            <motion.p variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-[#C6FF3A] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111111]">
              Next up{p ? ` · ${p.title}` : ""}
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-6 text-balance text-4xl font-black leading-[0.98] tracking-tight md:text-6xl">{event.title}</motion.h2>
            <motion.p variants={fadeUp} className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-white/55">{event.date} · {event.location}</motion.p>
            <motion.div variants={fadeUp}><Countdown target={event.eventDate} tone="light" className="mt-8" /></motion.div>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
              <a href={href} className="glow-lime inline-flex items-center gap-2 rounded-full bg-[#C6FF3A] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
                Save my seat <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
              {event.seatsNote && <span className="text-sm font-bold text-[#C6FF3A]">{event.seatsNote}</span>}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function CommunityEventsPageClient({ events, siteSettings, now, pillar }: Props) {
  const [room, setRoom] = useState<string>("ALL");
  const theme = pillar ? roomTheme(pillar.slug) : null;
  const ink = theme?.tone === "dark";

  // Pillar-scoped pages already receive category-filtered events from the server.
  const filtered = useMemo(
    () => (pillar || room === "ALL" ? events : events.filter((e) => e.category === room)),
    [events, pillar, room]
  );

  const { upcoming, past } = useMemo(() => {
    const up = filtered.filter((e) => new Date(e.eventDate).getTime() >= now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    const done = filtered.filter((e) => new Date(e.eventDate).getTime() < now)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    return { upcoming: up, past: done };
  }, [filtered, now]);

  // The board always shows the whole season (or room), not the current filter.
  const board = useMemo(() => {
    const up = events.filter((e) => new Date(e.eventDate).getTime() >= now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    if (up.length > 0) return { heading: "Next departures", rows: up.slice(0, 5).map((e, i) => boardRow(e, i === 0 ? "NEXT" : "OPEN", true)) };
    const done = [...events].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    return { heading: "Recently wrapped", rows: done.slice(0, 5).map((e) => boardRow(e, "WRAPPED", false)) };
  }, [events, now]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach((e) => { c[e.category] = (c[e.category] ?? 0) + 1; });
    return c;
  }, [events]);

  const facts = useMemo(() => {
    const cities = new Set(events.map((e) => city(e.location).toLowerCase()).filter(Boolean)).size;
    return [`${events.length} ${events.length === 1 ? "event" : "events"}`, `${cities} ${cities === 1 ? "city" : "cities"}`, "8,000+ founders", "Free for members"];
  }, [events]);

  const archive = useMemo(() => {
    const byYear = new Map<number, EventItem[]>();
    past.forEach((e) => {
      const y = new Date(e.eventDate).getFullYear();
      byYear.set(y, [...(byYear.get(y) ?? []), e]);
    });
    return [...byYear.entries()];
  }, [past]);

  const [nextUp, ...laterUpcoming] = upcoming;
  const otherRooms = pillar ? EVENT_PILLARS.filter((p) => p.slug !== pillar.slug) : [];

  return (
    <>
      <NavBar activePage="Community" ctaText="Apply to Join" ctaHref="/apply?source=community" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO + DEPARTURE BOARD ═══════════════════════════════════════ */}
        <section className={`relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-24 ${theme ? theme.hero : "bg-[#111111]"} ${ink ? "text-[#111111]" : "text-white"}`}>
          {theme && (
            <div aria-hidden className="pointer-events-none absolute -right-40 -top-10 hidden h-[480px] w-[384px] opacity-60 [mask-image:radial-gradient(closest-side,black_55%,transparent)] lg:block">
              <RoomMotif slug={pillar!.slug} play />
            </div>
          )}
          {!theme && <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#003CD1]/35 blur-[140px]" />}

          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}>
              <motion.a variants={fadeUp} href={pillar ? "/community/events" : "/community"}
                className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] ${ink ? "text-[#111111]/55 hover:text-[#111111]" : "text-white/55 hover:text-white"}`}>
                ← {pillar ? "All rooms" : "Community"}
              </motion.a>

              <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <motion.p variants={fadeUp} className={`text-xs font-semibold uppercase tracking-[0.14em] ${ink ? "text-[#003CD1]" : "text-[#C6FF3A]"}`}>
                    {pillar ? `Room ${theme!.code} · ${pillar.tagline}` : "Successbrew Events · Season 2026"}
                  </motion.p>
                  <h1 className="mt-5 max-w-4xl text-balance text-[clamp(3rem,8vw,7.5rem)] font-black leading-[0.9] tracking-tight">
                    {pillar ? (
                      <WordReveal text={pillar.title} mode="nested" staggerDelay={0.05} />
                    ) : (
                      <>
                        <WordReveal text="Find your" mode="nested" staggerDelay={0.06} />{" "}
                        <span className="text-gradient-lime"><WordReveal text="room." mode="nested" staggerDelay={0.06} /></span>
                      </>
                    )}
                  </h1>
                </div>
                <motion.p variants={fadeUp} className={`max-w-sm text-base lg:pb-3 lg:text-lg ${ink ? "text-[#111111]/70" : "text-white/65"}`}>
                  {pillar ? pillar.description : "Four rooms, one season. Summits, round tables, build nights and retreats — this is where Successbrew founders meet in person."}
                </motion.p>
              </div>

              <motion.ul variants={fadeUp} className={`mt-10 flex flex-wrap gap-x-6 gap-y-2 border-y py-4 text-xs font-semibold uppercase tracking-[0.14em] ${ink ? "border-[#111111]/15 text-[#111111]/60" : "border-white/10 text-white/55"}`}>
                {facts.map((f) => <li key={f} className="flex items-center gap-6">{f}<span aria-hidden className={ink ? "text-[#003CD1]" : "text-[#C6FF3A]"}>✦</span></li>)}
              </motion.ul>
            </motion.div>

            {board.rows.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35, ease: E }} className="mt-10">
                <DepartureBoard rows={board.rows} heading={board.heading} />
              </motion.div>
            )}
          </div>
        </section>

        {/* ══ ROOM PICKER (season page only) ══════════════════════════════ */}
        {!pillar && (
          <section className="bg-[#111111] pb-20 pt-4 text-white lg:pb-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight md:text-3xl">Pick a room.</h2>
                <button type="button" onClick={() => setRoom("ALL")}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${room === "ALL" ? "border-[#C6FF3A] bg-[#C6FF3A] text-[#111111]" : "border-white/20 text-white/70 hover:text-white"}`}>
                  All rooms
                </button>
              </div>
              <RoomPicker value={room} onChange={setRoom} counts={counts} />
            </div>
          </section>
        )}

        {/* ══ NEXT UP ═════════════════════════════════════════════════════ */}
        {nextUp && <NextUp event={nextUp} />}

        {/* ══ PROGRAMME ═══════════════════════════════════════════════════ */}
        <section id="upcoming" className="scroll-mt-24 bg-[#F2ECDD] py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#003CD1]">The programme</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Coming up.</h2>
              </div>
              <span className="text-sm font-semibold text-[#111111]/45">{laterUpcoming.length + (nextUp ? 1 : 0)} scheduled</span>
            </div>
            <ProgrammeList items={laterUpcoming.map((e) => toItem(e, true))}
              empty={nextUp
                ? "That's the only date on the calendar right now — more are being scheduled."
                : `Nothing on the calendar${pillar || room !== "ALL" ? " in this room" : ""} yet — new dates land here first.`} />
          </div>
        </section>

        {/* ══ ARCHIVE ═════════════════════════════════════════════════════ */}
        {archive.length > 0 && (
          <section className="bg-[#FFF3D0] py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#003CD1]">The archive</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Already brewed.</h2>
              <div className="mt-12 space-y-14">
                {archive.map(([year, list]) => (
                  <div key={year} className="grid gap-6 lg:grid-cols-[17rem_1fr]">
                    <p className="text-7xl font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_#111111] lg:sticky lg:top-28 lg:self-start">{year}</p>
                    <ProgrammeList compact items={list.map((e) => toItem(e, false))} empty="" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ OTHER ROOMS (room pages only) ═══════════════════════════════ */}
        {otherRooms.length > 0 && (
          <section className="bg-[#111111] py-16 text-white lg:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <h2 className="mb-8 text-2xl font-black tracking-tight md:text-3xl">Other rooms in the season.</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {otherRooms.map((p) => {
                  const t = roomTheme(p.slug);
                  return (
                    <a key={p.slug} href={`/community/events/${p.slug}`}
                      className={`group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1 ${t.surface}`}>
                      <RoomMotif slug={p.slug} play={false} />
                      <span className={`relative text-xl font-black uppercase leading-none ${t.tone === "light" ? "text-white" : "text-[#111111]"}`}>{p.title}</span>
                      <span className={`relative mt-2 text-xs font-medium ${t.tone === "light" ? "text-white/65" : "text-[#111111]/55"}`}>{p.tagline}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section className="bg-[#C6FF3A] py-20 lg:py-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}
            className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <motion.h2 variants={fadeUp} className="max-w-3xl text-balance text-5xl font-black leading-[0.92] tracking-tight text-[#111111] md:text-7xl">
              Members hear about every room first.
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <a href="/apply?source=community" className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-4 text-base font-bold text-white transition hover:translate-y-[-2px] hover:bg-[#003CD1]">
                Apply to Join <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
              <a href="/community" className="inline-flex items-center gap-2 rounded-full border border-[#111111]/25 px-8 py-4 text-base font-semibold text-[#111111] transition hover:bg-[#111111]/5">
                Explore Community
              </a>
            </motion.div>
          </motion.div>
        </section>

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
