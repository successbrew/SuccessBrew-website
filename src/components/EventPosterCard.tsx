"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { EventPillar } from "@/lib/event-pillars";
import { RoomMotif, roomTheme } from "@/components/community/rooms";

const E = [0.22, 1, 0.36, 1] as const;
const cardUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } } };

export function EventPosterCard({ pillar, count }: { pillar: EventPillar; count: number }) {
  const style = roomTheme(pillar.slug);
  const isLight = style.tone === "light";
  const ref = useRef<HTMLAnchorElement>(null);
  const [hot, setHot] = useState(false);
  // Touch screens have no hover, so the room performs once as it scrolls into view instead.
  const [touch, setTouch] = useState(false);
  const inView = useInView(ref, { once: true, margin: "-25% 0px -25% 0px" });

  useEffect(() => {
    // matchMedia is client-only; reading it after mount keeps SSR and hydration identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  return (
    <motion.div variants={cardUp} className="flex flex-col gap-4">
      <a
        ref={ref}
        href={`/community/events/${pillar.slug}`}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1.5 ${style.surface}`}
      >
        <RoomMotif slug={pillar.slug} play={hot || (touch && inView)} loop={hot} />

        <div className={`relative z-10 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] ${isLight ? "text-white/70" : "text-[#111111]/50"}`}>
          <span>Successbrew</span>
          <span>{style.code}</span>
        </div>

        <div className="relative z-10">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${isLight ? "bg-white/15 text-white" : "bg-[#111111]/8 text-[#111111]/70"}`}>
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
          className="inline-flex items-center gap-1.5 rounded-full bg-[#C6FF3A] px-4 py-2 text-xs font-bold text-[#111111] transition hover:bg-[#111111] hover:text-white"
        >
          Explore Room <span aria-hidden>↗</span>
        </a>
        <span className="text-xs font-semibold text-[#111111]/40">{count} event{count !== 1 ? "s" : ""}</span>
      </div>
    </motion.div>
  );
}
