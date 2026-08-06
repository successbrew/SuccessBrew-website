"use client";

import { motion } from "framer-motion";
import type { EventPillar } from "@/lib/event-pillars";

const E = [0.22, 1, 0.36, 1] as const;
const cardUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } } };

interface PosterStyle {
  code: string;
  eyebrow: string;
  bg: string;
  text: "light" | "dark";
  pattern: React.ReactNode;
}

const POSTER_STYLES: Record<string, PosterStyle> = {
  "revenue-room": {
    code: "01/04",
    eyebrow: "Investors",
    bg: "bg-[#0037D2]",
    text: "light",
    pattern: (
      <>
        <div aria-hidden className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#C1FF3B]/25 blur-3xl" />
        <div aria-hidden className="absolute left-8 top-24 h-24 w-24 rounded-full border border-white/15" />
        <div aria-hidden className="absolute left-16 top-32 h-16 w-16 rounded-full border border-white/20" />
      </>
    ),
  },
  "d2c-round-table": {
    code: "02/04",
    eyebrow: "D2C / Consumer",
    bg: "bg-[#F0EBD8]",
    text: "dark",
    pattern: (
      <>
        <div aria-hidden className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#111111]/10" />
        <div aria-hidden className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#111111]/10" />
        <div aria-hidden className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0037D2]/8" />
      </>
    ),
  },
  "tech-integrate": {
    code: "03/04",
    eyebrow: "Tech Founders",
    bg: "bg-[#111111]",
    text: "light",
    pattern: (
      <>
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(#C1FF3B 1px, transparent 1px), linear-gradient(90deg, #C1FF3B 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div aria-hidden className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-[#C1FF3B]/20 blur-3xl" />
      </>
    ),
  },
  "wellness-retreats": {
    code: "04/04",
    eyebrow: "Retreats",
    bg: "bg-gradient-to-br from-[#C1FF3B] to-[#F0EBD8]",
    text: "dark",
    pattern: (
      <>
        <div aria-hidden className="absolute right-6 top-10 h-28 w-28 rounded-full bg-white/40 blur-2xl" />
        <div aria-hidden className="absolute -left-6 bottom-16 h-36 w-36 rounded-full bg-[#0037D2]/10 blur-2xl" />
      </>
    ),
  },
};

export function EventPosterCard({ pillar, count }: { pillar: EventPillar; count: number }) {
  const style = POSTER_STYLES[pillar.slug];
  const isLight = style.text === "light";

  return (
    <motion.div variants={cardUp} className="flex flex-col gap-4">
      <a
        href={`/community/events/${pillar.slug}`}
        className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1.5 ${style.bg}`}
      >
        {style.pattern}

        <div className={`relative z-10 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? "text-white/70" : "text-[#111111]/50"}`}>
          <span>Successbrew</span>
          <span>{style.code}</span>
        </div>

        <div className="relative z-10">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${isLight ? "bg-white/15 text-white" : "bg-[#111111]/8 text-[#111111]/70"}`}>
            {style.eyebrow}
          </span>
          <h3 className={`mt-4 text-balance text-3xl font-black uppercase leading-[0.95] tracking-tight ${isLight ? "text-white" : "text-[#111111]"}`}>
            {pillar.title}
          </h3>
          <p className={`mt-2 text-sm font-medium ${isLight ? "text-white/70" : "text-[#111111]/60"}`}>{pillar.tagline}</p>
        </div>
      </a>

      <div className="flex items-center justify-between px-1">
        <a
          href={`/community/events/${pillar.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#C1FF3B] px-4 py-2 text-xs font-bold text-[#111111] transition hover:bg-[#111111] hover:text-white"
        >
          Explore Room <span aria-hidden>↗</span>
        </a>
        <span className="text-xs font-semibold text-[#111111]/40">{count} event{count !== 1 ? "s" : ""}</span>
      </div>
    </motion.div>
  );
}
