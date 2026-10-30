/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useScroll } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ArrowRight, ArrowUpRight, Scissors } from "lucide-react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { WordReveal } from "@/components/WordReveal";
import { ScrollAutoplayYouTube } from "@/components/ScrollAutoplayYouTube";
import type { SiteSettings } from "@/components/SocialLinks";
import type { EventPillar } from "@/lib/event-pillars";
import { getSmoothScroll } from "@/components/SmoothScroll";
import { RoomMotif, roomTheme } from "@/components/community/rooms";
import { Countdown } from "@/components/community/Countdown";
import { ProgrammeList } from "@/components/events/ProgrammeList";
import { istDateStamp } from "@/lib/event-dates";
import { prefersReducedMotionNow } from "@/lib/motion-policy";

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
  imageUrl: string;
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
  const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${istDateStamp(d)}/${istDateStamp(next)}`,
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
      className="flex-1 rounded-full border border-[#111111]/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]/70 transition hover:border-[#111111]/30"
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
    if (prefersReducedMotionNow()) return;
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
            <div className="grid h-full w-full place-items-center bg-[#003CD1]/50 text-6xl font-black text-white/40">
              {person.name.charAt(0)}
            </div>
          )}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <span className="inline-block rounded-full bg-[#C6FF3A] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#111111]">
              {person.isHost ? "Host" : "Speaker"}
            </span>
            <p className="mt-3 text-2xl font-black leading-tight text-white">{person.name}</p>
            {person.role && <p className="mt-1 text-sm font-semibold text-[#C6FF3A]">{person.role}</p>}
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
    <div className="sticky top-20 z-30 mt-10 border-b border-[#111111]/8 bg-[#F2ECDD]/92 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 lg:px-10">
        <div className="hide-scrollbar flex grow items-center gap-1 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => smoothScrollToId(item.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
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
          className="ml-2 hidden shrink-0 items-center gap-1.5 rounded-full bg-[#C6FF3A] px-4 py-1.5 text-xs font-bold text-[#111111] transition hover:translate-y-[-1px] sm:inline-flex"
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

/** Little poster "stamp" of the room this event belongs to — links back to it
 * and performs the room's motif once on load (and again on hover). */
function RoomStamp({ pillar }: { pillar: EventPillar }) {
  const theme = roomTheme(pillar.slug);
  const [hot, setHot] = useState(false);
  const [landed, setLanded] = useState(false);
  return (
    <motion.a href={`/community/events/${pillar.slug}`} aria-label={`Part of ${pillar.title}`}
      onMouseEnter={() => setHot(true)} onMouseLeave={() => setHot(false)}
      initial={{ opacity: 0, rotate: -12, scale: 0.8 }} animate={{ opacity: 1, rotate: -4, scale: 1 }}
      whileHover={{ rotate: 0, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}
      onAnimationComplete={() => setLanded(true)}
      className={`relative block h-[72px] w-[58px] shrink-0 overflow-hidden rounded-lg shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] ring-2 ring-white/80 ${theme.surface}`}>
      <RoomMotif slug={pillar.slug} play={landed || hot} loop={hot} />
      <span className={`absolute bottom-1 left-1.5 text-[8px] font-bold ${theme.tone === "light" ? "text-white/80" : "text-[#111111]/60"}`}>{theme.code}</span>
    </motion.a>
  );
}

/** Seats claimed vs. total, filling once when it scrolls into view. */
function SeatsBar({ total, remaining }: { total: number; remaining: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = usePrefersReducedMotion();
  const claimed = Math.min(1, Math.max(0, (total - remaining) / total));
  return (
    <div ref={ref} className="w-full">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-[#111111]/45">
        <span>{total - remaining} seats claimed</span>
        <span className="text-[#003CD1]">{remaining} left</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#111111]/8">
        <motion.div initial={{ scaleX: reduced ? claimed : 0 }} animate={inView ? { scaleX: claimed } : undefined}
          transition={{ duration: 1.2, ease: E }}
          className="h-full origin-left rounded-full bg-gradient-to-r from-[#003CD1] to-[#C6FF3A]" />
      </div>
    </div>
  );
}

/** Agenda with a rail that fills as you read down it; each stop lights up as it
 * reaches the middle of the screen. */
function AgendaRail({ items, timed }: { items: AgendaItem[]; timed: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  return (
    <div ref={ref} className="relative pl-7 sm:pl-9">
      <div aria-hidden className="absolute bottom-0 left-0 top-0 w-0.5 rounded-full bg-[#111111]/8" />
      <motion.div aria-hidden style={{ scaleY: reduced ? 1 : scrollYProgress }}
        className="absolute bottom-0 left-0 top-0 w-0.5 origin-top rounded-full bg-gradient-to-b from-[#003CD1] to-[#C6FF3A]" />
      {items.map((item, i) => (
        <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "0px 0px -40% 0px" }}
          variants={fadeUp} className="relative pb-10 last:pb-0">
          <motion.span aria-hidden
            variants={{ hidden: { scale: 0.5, backgroundColor: "#FFFFFF" }, visible: { scale: 1, backgroundColor: "#003CD1", transition: { duration: 0.4, ease: E } } }}
            className="absolute -left-[35px] top-1.5 h-4 w-4 rounded-full border-2 border-[#003CD1] ring-4 ring-white sm:-left-[43px]" />
          {timed && item.time && (
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#003CD1]">{item.time}</p>
          )}
          <h3 className="mt-1 text-lg font-black text-[#111111] sm:text-xl">{item.title}</h3>
          {item.description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#111111]/60">{item.description}</p>}
        </motion.div>
      ))}
    </div>
  );
}

/** The facts card, drawn as a ticket: admission details on the left, a torn-off
 * stub on the right with the countdown and the register action. */
function Ticket({ event, pillar, registerHref, now }: { event: EventLandingData; pillar: EventPillar; registerHref: string; now: number }) {
  const theme = roomTheme(pillar.slug);
  const upcoming = new Date(event.eventDate).getTime() > now;
  const facts = [
    { label: "Date", value: event.date },
    { label: "Time", value: event.timeRange ?? "TBA" },
    { label: "Venue", value: event.location },
    { label: "Seats", value: seatsSummary(event, { totalSuffix: "seats", fallback: "Open seating" }) },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 40, rotate: -1 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.8, ease: E }}
      className="relative grid overflow-hidden rounded-3xl bg-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.45)] lg:grid-cols-[1fr_auto_auto]">
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between gap-4 border-b border-dashed border-[#111111]/15 pb-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111111]/45">Admit one · Room {theme.code}</span>
          {event.priceNote && <span className="rounded-full bg-[#111111] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">{event.priceNote}</span>}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111111]/40">{f.label}</dt>
              <dd className="mt-1.5 text-base font-black leading-snug text-[#111111]">{f.value}</dd>
            </div>
          ))}
        </dl>
        {event.showRemainingSeats && event.totalSeats && event.remainingSeats != null && (
          <div className="mt-7"><SeatsBar total={event.totalSeats} remaining={event.remainingSeats} /></div>
        )}
      </div>

      {/* Perforation: notches punched out of the card edges + a dashed tear line. */}
      <div aria-hidden className="relative hidden w-0 lg:block">
        <span className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-[#F2ECDD]" />
        <span className="absolute -bottom-4 -left-4 h-8 w-8 rounded-full bg-[#F2ECDD]" />
        <span className="absolute bottom-6 top-6 left-0 border-l-2 border-dashed border-[#111111]/15" />
      </div>
      <div aria-hidden className="relative h-0 lg:hidden">
        <span className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-[#F2ECDD]" />
        <span className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-[#F2ECDD]" />
        <span className="absolute left-6 right-6 top-0 border-t-2 border-dashed border-[#111111]/15" />
      </div>

      <div className={`relative flex flex-col justify-between gap-6 p-6 sm:p-8 lg:w-[22rem] lg:p-10 ${theme.surface} ${theme.tone === "light" ? "text-white" : "text-[#111111]"}`}>
        <div className="relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60">{upcoming ? "Doors open in" : "This room has wrapped"}</p>
          {upcoming ? (
            <Countdown target={event.eventDate} tone={theme.tone === "light" ? "light" : "dark"} className="mt-3" />
          ) : (
            <p className="mt-3 text-2xl font-black leading-tight">Catch the next one in {pillar.title}.</p>
          )}
        </div>
        <div className="relative z-10">
          <a href={upcoming ? registerHref : `/community/events/${pillar.slug}`} target={upcoming && event.registerUrl ? "_blank" : undefined} rel="noreferrer noopener"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition hover:translate-y-[-2px] ${theme.tone === "light" ? "bg-[#C6FF3A] text-[#111111]" : "bg-[#111111] text-white"}`}>
            {upcoming ? "Save my seat" : "See upcoming dates"} <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </a>
          {/* Decorative barcode. */}
          <div aria-hidden className="mt-5 h-8 w-full opacity-50 [background:repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_4px,currentColor_4px_5px,transparent_5px_9px)]" />
        </div>
      </div>
    </motion.div>
  );
}

/** Desktop table of contents for the body: sticks beside the content and marks
 * the section you're reading. */
function SideIndex({ items, activeId, registerHref, hasRegisterUrl, calendarHref }: {
  items: { id: string; label: string }[]; activeId: string | null; registerHref: string; hasRegisterUrl: boolean; calendarHref: string;
}) {
  return (
    <nav aria-label="On this page" className="sticky top-28 hidden self-start lg:block">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111111]/40">On this page</p>
      <ol className="space-y-1 border-l border-[#111111]/10">
        {items.map((item, i) => {
          const on = activeId === item.id;
          return (
            <li key={item.id} className="relative">
              {on && <motion.span layoutId="side-index" className="absolute -left-px top-0 h-full w-0.5 bg-[#003CD1]" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
              <button type="button" onClick={() => smoothScrollToId(item.id)}
                className={`flex w-full items-baseline gap-3 py-1.5 pl-4 text-left text-sm transition-colors ${on ? "font-bold text-[#111111]" : "text-[#111111]/50 hover:text-[#111111]"}`}>
                <span className="w-5 text-[10px] tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 space-y-2">
        <a href={registerHref} target={hasRegisterUrl ? "_blank" : undefined} rel="noreferrer noopener"
          className="flex items-center justify-center gap-2 rounded-full bg-[#C6FF3A] px-5 py-3 text-sm font-bold text-[#111111] transition hover:translate-y-[-1px]">
          Register <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
        </a>
        <a href={calendarHref} target="_blank" rel="noreferrer noopener"
          className="flex items-center justify-center rounded-full border border-[#111111]/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#111111]/70 transition hover:border-[#111111]/30">
          Add to calendar
        </a>
      </div>
    </nav>
  );
}

/** Body section heading: small running number + title, so the page reads like
 * a printed programme. */
function SectionHead({ n, kicker, title }: { n: number; kicker: string; title: string }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-8 flex items-baseline gap-4 border-t border-[#111111]/15 pt-6">
      <span className="text-xs font-semibold tabular-nums text-[#003CD1]">{String(n).padStart(2, "0")}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111111]/45">{kicker}</p>
        <h2 className="mt-2 text-balance text-3xl font-black tracking-tight md:text-4xl">{title}</h2>
      </div>
    </motion.div>
  );
}

/** Portrait that slides its bio up over the photo on hover/focus. */
function PersonCard({ name, role, bio, photoUrl, badge }: { name: string; role: string | null; bio: string | null; photoUrl: string | null; badge: string }) {
  return (
    <motion.div variants={fadeUp} tabIndex={bio ? 0 : undefined}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#003CD1]">
      {photoUrl ? (
        <img src={photoUrl} alt={name} loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105 group-focus:scale-105" />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[#003CD1] text-6xl font-black text-white/30">{name.charAt(0)}</div>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-[#C6FF3A] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#111111]">{badge}</span>
      <div className="absolute inset-x-0 bottom-0 p-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <p className="text-lg font-black leading-tight text-white">{name}</p>
        {role && <p className="mt-1 text-xs font-semibold text-[#C6FF3A]">{role}</p>}
        {bio && (
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 group-hover:grid-rows-[1fr] group-focus:grid-rows-[1fr]">
            <p className="overflow-hidden text-xs leading-relaxed text-white/75"><span className="block pt-3">{bio}</span></p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function EventLandingPageClient({
  pillar,
  event,
  relatedEvents,
  siteSettings,
  testimonials,
  now,
}: {
  pillar: EventPillar;
  event: EventLandingData;
  relatedEvents: RelatedEvent[];
  siteSettings: SiteSettings;
  testimonials: EventTestimonial[];
  /** Request time from the server, so "upcoming vs. wrapped" renders the same on both sides. */
  now: number;
}) {
  const theme = roomTheme(pillar.slug);
  const ink = theme.tone === "dark";
  const upcoming = new Date(event.eventDate).getTime() > now;
  // A wrapped event sends people to the room's next dates instead of a dead registration link.
  const ctaHref = upcoming ? (event.registerUrl ?? "#registration") : `/community/events/${pillar.slug}`;
  const ctaExternal = upcoming && !!event.registerUrl;
  const ctaLabel = upcoming ? "Save my seat" : "See upcoming dates";
  const agendaItems = useMemo(() => parseAgenda(event.agenda), [event.agenda]);
  const benefitItems = useMemo(() => parseBenefits(event.benefits), [event.benefits]);
  const faqItems = useMemo(() => parseFaq(event.faq), [event.faq]);
  const venue = event.venueAddress || event.location;
  const registerHref = event.registerUrl ?? "#registration";
  const hasTimedAgenda = agendaItems.some((a) => a.time);
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
        { id: "speakers", label: "Speakers", show: hasSpeakerSection },
        { id: "schedule", label: "Schedule", show: agendaItems.length > 0 },
        { id: "gallery", label: "Gallery", show: event.galleryUrls.length >= 2 },
        { id: "audience", label: "Who's In The Room", show: hasAudienceSection },
        { id: "location", label: "Location", show: !!venue },
        { id: "voices", label: "Voices", show: testimonials.length > 0 },
        { id: "faq", label: "FAQ", show: faqItems.length > 0 },
      ].filter((i) => i.show),
    [benefitItems.length, event.galleryUrls.length, hasSpeakerSection, agendaItems.length, hasAudienceSection, venue, testimonials.length, faqItems.length]
  );
  const activeId = useActiveSection(navItems.map((i) => i.id));
  const num = (id: string) => navItems.findIndex((i) => i.id === id) + 1;

  return (
    <>
      <NavBar activePage="Community" ctaText="Apply to Join" ctaHref="/apply?source=community" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO — the room's colours, the poster in a frame ════════════ */}
        <section className={`relative overflow-hidden pb-32 pt-32 lg:pb-40 lg:pt-40 ${theme.hero} ${ink ? "text-[#111111]" : "text-white"}`}>
          <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-[420px] w-[340px] opacity-40 [mask-image:radial-gradient(closest-side,black_50%,transparent)]">
            <RoomMotif slug={pillar.slug} play />
          </div>
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}>
              <motion.a variants={fadeUp} href={`/community/events/${pillar.slug}`}
                className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] ${ink ? "text-[#111111]/55 hover:text-[#111111]" : "text-white/55 hover:text-white"}`}>
                ← {pillar.title}
              </motion.a>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${ink ? "bg-[#111111] text-white" : "bg-[#C6FF3A] text-[#111111]"}`}>{event.tag}</span>
                <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${ink ? "border-[#111111]/20" : "border-white/25"}`}>{firstToken(event.location)}</span>
                <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${ink ? "border-[#111111]/20" : "border-white/25"}`}>{event.date}</span>
              </motion.div>

              <h1 className="mt-6 text-balance text-[clamp(2.75rem,6.5vw,5.75rem)] font-black leading-[0.92] tracking-tight">
                <WordReveal text={event.title} mode="nested" staggerDelay={0.05} />
              </h1>

              {event.subtitle && (
                <motion.p variants={fadeUp} className={`mt-6 max-w-xl text-lg sm:text-xl ${ink ? "text-[#111111]/70" : "text-white/70"}`}>{event.subtitle}</motion.p>
              )}

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <a href={ctaHref} target={ctaExternal ? "_blank" : undefined} rel="noreferrer noopener"
                  className={`inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition hover:translate-y-[-2px] ${ink ? "bg-[#111111] text-white hover:bg-[#003CD1]" : "glow-lime bg-[#C6FF3A] text-[#111111]"}`}>
                  {ctaLabel} <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </a>
                <RoomStamp pillar={pillar} />
              </motion.div>
            </motion.div>

            {/* Poster frame: covers are pre-designed banners, so they're shown whole
                (contain) over a blurred copy of themselves rather than cropped. */}
            <motion.div initial={{ opacity: 0, y: 40, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: 2 }} whileHover={{ rotate: 0, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.25 }}
              className="relative mx-auto w-full max-w-[440px]">
              {event.imageUrl ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#111111] shadow-[0_50px_90px_-40px_rgba(0,0,0,0.7)] ring-8 ring-white/90">
                  <div aria-hidden className="absolute inset-0 scale-125 bg-cover bg-center opacity-60 blur-2xl" style={{ backgroundImage: `url(${event.imageUrl})` }} />
                  <img src={event.imageUrl} alt={event.title} className="relative h-full w-full object-contain" />
                </div>
              ) : heroPeople.length > 0 ? (
                <HeroSpeakerSlideshow people={heroPeople} />
              ) : (
                <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl ring-8 ring-white/90 ${theme.surface}`}><RoomMotif slug={pillar.slug} play /></div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ══ TICKET ════════════════════════════════════════════════════ */}
        <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-6 lg:px-10">
          <Ticket event={event} pillar={pillar} registerHref={registerHref} now={now} />
        </div>

        {/* Mobile/tablet jump nav; desktop gets the side index instead. */}
        <SectionNav items={navItems} activeId={activeId} registerHref={registerHref} hasRegisterUrl={!!event.registerUrl} />

        {/* ══ BODY: side index + programme ═══════════════════════════════ */}
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[13rem_1fr] lg:gap-16 lg:px-10 lg:py-24">
          <SideIndex items={navItems} activeId={activeId} registerHref={registerHref} hasRegisterUrl={!!event.registerUrl} calendarHref={googleCalendarUrl(event)} />

          <div className="min-w-0 space-y-20 lg:space-y-28">
            {/* Overview */}
            <section id="overview" className="scroll-mt-36">
              <SectionHead n={num("overview")} kicker={`${pillar.icon} About ${pillar.title}`} title={pillar.tagline} />
              <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
                <p className="text-lg leading-relaxed text-[#111111]/70">{pillar.description}</p>
                {event.highlightStatValue ? (
                  <div className="rounded-2xl bg-[#111111] p-6 text-white">
                    <p className="text-5xl font-black tracking-tight text-[#C6FF3A]">{event.highlightStatValue}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/60">{event.highlightStatLabel}</p>
                  </div>
                ) : event.subtitle ? (
                  <blockquote className="border-l-4 border-[#C6FF3A] pl-5 text-xl font-bold leading-snug">{event.subtitle}</blockquote>
                ) : null}
              </div>
              {videoId && (
                <div className="mt-10 aspect-video overflow-hidden rounded-2xl bg-[#111111]">
                  <ScrollAutoplayYouTube videoId={videoId} title={`${event.title} recap`} className="h-full w-full" />
                </div>
              )}
            </section>

            {/* Highlights — numbered, editorial rows */}
            {benefitItems.length > 0 && (
              <section id="highlights" className="scroll-mt-36">
                <SectionHead n={num("highlights")} kicker="The experience" title="What you walk away with." />
                <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}>
                  {benefitItems.map((b, i) => (
                    <motion.li key={i} variants={fadeUp} className="group grid grid-cols-[4.5rem_1fr] gap-4 border-b border-[#111111]/10 py-6 first:pt-0 sm:grid-cols-[6rem_1fr]">
                      <span className="text-5xl font-black leading-none tracking-tighter text-transparent transition-colors duration-300 [-webkit-text-stroke:1.5px_#003CD1] group-hover:text-[#003CD1] sm:text-6xl">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="text-xl font-black leading-snug">{b.title}</h3>
                        {b.description && <p className="mt-2 text-sm leading-relaxed text-[#111111]/60">{b.description}</p>}
                      </div>
                    </motion.li>
                  ))}
                </motion.ol>
              </section>
            )}

            {/* Speakers */}
            {hasSpeakerSection && (
              <section id="speakers" className="scroll-mt-36">
                <SectionHead n={num("speakers")} kicker="On the mic" title="Who you'll hear from." />
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
                  className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {event.speakers.map((s) => <PersonCard key={s.id} name={s.name} role={s.role} bio={s.bio} photoUrl={s.photoUrl} badge="Speaker" />)}
                  {event.hostName && <PersonCard name={event.hostName} role={event.hostRole} bio={event.hostBio} photoUrl={event.hostPhotoUrl} badge="Host" />}
                </motion.div>
              </section>
            )}

            {/* Schedule */}
            {agendaItems.length > 0 && (
              <section id="schedule" className="scroll-mt-36">
                <SectionHead n={num("schedule")} kicker="Run of show" title="The agenda." />
                <div className="rounded-3xl bg-white p-6 sm:p-10">
                  <AgendaRail items={agendaItems} timed={hasTimedAgenda} />
                </div>
              </section>
            )}

            {/* Gallery — a draggable film strip */}
            {event.galleryUrls.length >= 2 && (
              <section id="gallery" className="scroll-mt-36">
                <SectionHead n={num("gallery")} kicker="The room" title="What it actually feels like." />
                <div className="hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 lg:mx-0 lg:px-0">
                  {event.galleryUrls.map((url, i) => (
                    <motion.div key={url + i}
                      initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: Math.min(i, 5) * 0.06, ease: E }}
                      className={`relative shrink-0 snap-start overflow-hidden rounded-2xl bg-[#111111]/5 ${i % 3 === 0 ? "h-[300px] w-[240px]" : "h-[300px] w-[380px]"} sm:h-[360px] ${i % 3 === 0 ? "sm:w-[280px]" : "sm:w-[460px]"}`}>
                      <img src={url} alt={`${event.title} — photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                    </motion.div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111111]/40">Swipe for more →</p>
              </section>
            )}

            {/* Who's in the room */}
            {hasAudienceSection && (
              <section id="audience" className="scroll-mt-36">
                <SectionHead n={num("audience")} kicker="Who's in the room" title="Built for the room, not the crowd." />
                {event.audienceNote && <p className="max-w-2xl text-lg leading-relaxed text-[#111111]/70">{event.audienceNote}</p>}
                {event.audienceTags.length > 0 && (
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.05)} className="mt-8 flex flex-wrap gap-3">
                    {event.audienceTags.map((t, i) => (
                      <motion.span key={i} variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } } }}
                        className={`rounded-full px-5 py-2.5 text-sm font-bold ${["bg-[#003CD1] text-white", "bg-[#C6FF3A] text-[#111111]", "bg-white text-[#111111]", "bg-[#111111] text-white"][i % 4]}`}>
                        {t}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
                {event.totalSeats && (
                  <p className="mt-8 text-sm font-semibold text-[#111111]/55">Capped at <span className="text-[#003CD1]">{event.totalSeats} seats</span> so every conversation stays real.</p>
                )}
              </section>
            )}

            {/* Location */}
            {venue && (
              <section id="location" className="scroll-mt-36">
                <SectionHead n={num("location")} kicker="Getting there" title="Find the room." />
                <div className="overflow-hidden rounded-3xl bg-white">
                  <div className="grid md:grid-cols-[1fr_1.2fr]">
                    <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
                      <div>
                        <p className="text-2xl font-black">{event.location}</p>
                        {event.venueAddress && <p className="mt-2 text-sm leading-relaxed text-[#111111]/60">{event.venueAddress}</p>}
                      </div>
                      {event.venuePhotoUrl && <img src={event.venuePhotoUrl} alt={event.location} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" />}
                      <div className="flex gap-3">
                        <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer noopener"
                          className="flex-1 rounded-full bg-[#111111] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#003CD1]">
                          Add to calendar
                        </a>
                        <ShareButton title={event.title} />
                      </div>
                    </div>
                    <div className="min-h-[280px] bg-[#FFF3D0]">
                      <iframe title={`Map to ${event.location}`} src={`https://www.google.com/maps?q=${encodeURIComponent(venue)}&output=embed`}
                        className="h-full min-h-[280px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Voices */}
            {testimonials.length > 0 && (
              <section id="voices" className="scroll-mt-36">
                <SectionHead n={num("voices")} kicker="Community voices" title="People who've been in the room." />
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)} className="space-y-4">
                  {testimonials.slice(0, 3).map((t, i) => (
                    <motion.figure key={t.id} variants={fadeUp}
                      className={`relative rounded-3xl p-6 sm:p-8 ${i === 0 ? "bg-[#111111] text-white" : "bg-white"}`}>
                      <span aria-hidden className={`absolute right-6 top-2 text-8xl font-black leading-none ${i === 0 ? "text-[#C6FF3A]/25" : "text-[#003CD1]/10"}`}>&ldquo;</span>
                      <blockquote className={`relative line-clamp-4 text-base leading-relaxed sm:text-lg ${i === 0 ? "text-white/85" : "text-[#111111]/75"}`}>{t.quote}</blockquote>
                      <figcaption className="mt-5 flex items-center gap-3">
                        {t.avatarUrl ? (
                          <img src={t.avatarUrl} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#003CD1] text-sm font-black text-white">{t.initial}</span>
                        )}
                        <div>
                          <p className="text-sm font-black">{t.name}</p>
                          <p className={`line-clamp-1 text-xs ${i === 0 ? "text-white/50" : "text-[#111111]/50"}`}>{t.role}</p>
                        </div>
                      </figcaption>
                    </motion.figure>
                  ))}
                </motion.div>
              </section>
            )}

            {/* FAQ */}
            {faqItems.length > 0 && (
              <section id="faq" className="scroll-mt-36">
                <SectionHead n={num("faq")} kicker="Good to know" title="Frequently asked." />
                <div className="rounded-3xl bg-white px-6 sm:px-8">
                  {faqItems.map((item, i) => (
                    <FaqRow key={i} item={item} isOpen={openFaqIndex === i} onToggle={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ══ TEAR-OFF CTA ══════════════════════════════════════════════ */}
        <section id="registration" className={`relative scroll-mt-24 overflow-hidden py-20 lg:py-28 ${theme.hero} ${ink ? "text-[#111111]" : "text-white"}`}>
          <div aria-hidden className={`absolute inset-x-0 top-0 flex items-center gap-3 px-6 ${ink ? "text-[#111111]/40" : "text-white/40"}`}>
            <Scissors className="h-4 w-4 -rotate-90" />
            <span className="h-0 flex-1 border-t-2 border-dashed border-current" />
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}
            className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <div>
              <motion.p variants={fadeUp} className={`text-xs font-semibold uppercase tracking-[0.14em] ${ink ? "text-[#003CD1]" : "text-[#C6FF3A]"}`}>
                {upcoming
                  ? `${event.priceNote ?? "Reserve your seat"} · ${seatsSummary(event, { totalSuffix: "seats total", fallback: "Limited seating" })}`
                  : `This room has wrapped · ${pillar.title}`}
              </motion.p>
              <motion.h2 variants={fadeUp} className="mt-4 max-w-2xl text-balance text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
                {upcoming ? "Tear here. Take a seat." : "Catch the next one."}
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <a href={ctaHref} target={ctaExternal ? "_blank" : undefined} rel="noreferrer noopener"
                className={`inline-flex items-center gap-2 rounded-full px-9 py-5 text-base font-bold transition hover:translate-y-[-2px] ${ink ? "bg-[#111111] text-white hover:bg-[#003CD1]" : "glow-lime bg-[#C6FF3A] text-[#111111]"}`}>
                {ctaLabel} <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
              {upcoming && !event.registerUrl && <p className={`mt-4 text-xs ${ink ? "text-[#111111]/50" : "text-white/50"}`}>Registration link coming soon — check back shortly.</p>}
            </motion.div>
          </motion.div>
        </section>

        {/* ══ ALSO IN THIS ROOM ═════════════════════════════════════════ */}
        {relatedEvents.length > 0 && (
          <section className="bg-[#F2ECDD] py-16 lg:py-20">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
              <div className="mb-8 flex items-end justify-between gap-4">
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">Also in {pillar.title}.</h2>
                <a href={`/community/events/${pillar.slug}`} className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#003CD1] hover:underline">Whole room →</a>
              </div>
              <ProgrammeList compact empty=""
                items={relatedEvents.map((r) => ({
                  id: r.id, href: `/community/events/${pillar.slug}/${r.id}`, external: false, title: r.title, tag: r.tag,
                  eventDate: r.eventDate, city: firstToken(r.location), room: { label: pillar.title, swatch: theme.surface }, imageUrl: r.imageUrl,
                }))} />
            </div>
          </section>
        )}

        {/* ══ PARTNERS ══════════════════════════════════════════════════ */}
        {(event.partners.length > 0 || event.becomePartnerUrl) && (
          <section className="border-t border-[#111111]/10 bg-[#F2ECDD] py-14 lg:py-16">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
                {event.partners.length > 0 && <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111111]/40">With</span>}
                {event.partners.map((p) => {
                  const logo = <img src={p.logoUrl} alt={p.name} className="h-8 w-auto object-contain grayscale transition hover:grayscale-0" />;
                  return p.websiteUrl ? (
                    <a key={p.id} href={p.websiteUrl} target="_blank" rel="noreferrer noopener" aria-label={p.name}>{logo}</a>
                  ) : (
                    <span key={p.id}>{logo}</span>
                  );
                })}
              </div>
              {event.becomePartnerUrl && (
                <a href={event.becomePartnerUrl} target="_blank" rel="noreferrer noopener"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#111111]/20 px-6 py-3 text-sm font-bold transition hover:bg-[#111111] hover:text-white">
                  Sponsor this room <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </a>
              )}
            </div>
          </section>
        )}

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
