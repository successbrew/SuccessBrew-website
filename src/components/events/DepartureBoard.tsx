"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** One split-flap field: fixed width in characters, scrambles through glyphs
 * and settles left → right once it scrolls into view. Starts blank on the
 * server so hydration never disagrees; reduced motion settles instantly. */
function FlapField({ text, width, start, play, tone }: { text: string; width: number; start: number; play: boolean; tone: "ink" | "lime" }) {
  const target = text.toUpperCase().slice(0, width).padEnd(width, " ");
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(" ".repeat(width));

  useEffect(() => {
    if (!play) return;
    if (reduced) {
      // Reduced motion: no scramble, just show the final board in one step.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(target);
      return;
    }
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const elapsed = performance.now() - t0;
      let done = true;
      const next = target.split("").map((ch, i) => {
        const settleAt = start + 260 + i * 38;
        if (elapsed >= settleAt || ch === " ") return ch;
        done = false;
        return elapsed < start ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join("");
      setShown(next);
      if (done) window.clearInterval(id);
    }, 50);
    return () => window.clearInterval(id);
  }, [play, reduced, target, start]);

  return (
    <span aria-hidden className="inline-flex gap-[2px]">
      {shown.split("").map((ch, i) => (
        <span key={i}
          className={`relative inline-grid h-[1.75em] w-[1.15em] place-items-center rounded-[3px] bg-[linear-gradient(#232323_50%,#1A1A1A_50%)] font-semibold tabular-nums ${tone === "lime" ? "text-[#C6FF3A]" : "text-[#F2ECDD]"}`}>
          {ch === " " ? " " : ch}
          <span className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
        </span>
      ))}
    </span>
  );
}

/** Column label sized by an invisible field of the same width, so headings line
 * up with the tiles at every font size. */
function HeadCell({ label, width }: { label: string; width: number }) {
  return (
    <span className="relative block h-5">
      <span className="invisible block h-0 overflow-hidden"><FlapField text="" width={width} start={0} play={false} tone="ink" /></span>
      <span className="absolute left-0 top-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">{label}</span>
    </span>
  );
}

export interface BoardRow {
  key: string;
  href: string;
  date: string;
  room: string;
  title: string;
  city: string;
  status: string;
  live: boolean;
}

/** "Departures" board: the next events as split-flap rows. Each row is a link
 * with a real text label; the flap tiles are decoration. */
export function DepartureBoard({ rows, heading }: { rows: BoardRow[]; heading: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const play = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0B] p-4 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] sm:p-6">
      <div className="mb-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C6FF3A]" />
          {heading}
        </span>
        <span className="hidden sm:inline">Successbrew · Season 2026</span>
      </div>
      <ul className="space-y-1.5 text-[10px] sm:text-[12px] lg:text-[13px]">
        <li aria-hidden className="hidden grid-cols-[auto_auto_1fr_auto_auto] gap-x-5 px-2 lg:grid">
          <HeadCell label="Date" width={6} /><HeadCell label="Room" width={7} /><HeadCell label="Event" width={24} />
          <HeadCell label="City" width={9} /><HeadCell label="Status" width={7} />
        </li>
        {rows.map((r, i) => (
          <li key={r.key}>
            <a href={r.href} aria-label={`${r.title}, ${r.date}, ${r.city} — ${r.status}`}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04] sm:gap-x-5 lg:grid-cols-[auto_auto_1fr_auto_auto]">
              <FlapField text={r.date} width={6} start={i * 140} play={play} tone="ink" />
              <span className="hidden lg:inline"><FlapField text={r.room} width={7} start={i * 140 + 80} play={play} tone="ink" /></span>
              <span className="min-w-0 overflow-hidden"><FlapField text={r.title} width={24} start={i * 140 + 160} play={play} tone="ink" /></span>
              <span className="hidden lg:inline"><FlapField text={r.city} width={9} start={i * 140 + 240} play={play} tone="ink" /></span>
              <FlapField text={r.status} width={7} start={i * 140 + 320} play={play} tone={r.live ? "lime" : "ink"} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
