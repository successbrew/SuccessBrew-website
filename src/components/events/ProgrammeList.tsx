/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ArrowUpRight } from "lucide-react";
import { eventDateParts } from "@/lib/event-dates";

const E = [0.22, 1, 0.36, 1] as const;

export interface ProgrammeItem {
  id: string;
  href: string;
  external: boolean;
  title: string;
  tag: string;
  eventDate: string;
  city: string;
  room: { label: string; swatch: string } | null;
  imageUrl: string;
  note?: string;
}

/** Floating poster that trails the cursor while a row is hovered, leaning into
 * the direction of travel. Fine pointers only. */
function CursorPoster({ item }: { item: ProgrammeItem | null }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });
  const rotate = useTransform(useVelocity(sx), [-1200, 0, 1200], [-9, 0, 9], { clamp: true });

  useEffect(() => {
    const move = (e: PointerEvent) => { x.set(e.clientX + 28); y.set(e.clientY - 150); };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <motion.div aria-hidden style={{ x: sx, y: sy, rotate }} className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block">
      <AnimatePresence>
        {item?.imageUrl && (
          <motion.div key={item.id}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: E }}
            className="absolute left-0 top-0 h-[300px] w-[240px] overflow-hidden rounded-xl bg-[#111111] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0 scale-125 bg-cover bg-center opacity-60 blur-xl" style={{ backgroundImage: `url(${item.imageUrl})` }} />
            <img src={item.imageUrl} alt="" className="relative h-full w-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Editorial programme: one row per event with an oversized date. `compact`
 * is the archive variant — tighter rows, smaller type. */
export function ProgrammeList({ items, compact = false, empty }: { items: ProgrammeItem[]; compact?: boolean; empty: string }) {
  const reduced = usePrefersReducedMotion();
  const [hover, setHover] = useState<ProgrammeItem | null>(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    // matchMedia is client-only; reading it after mount keeps hydration stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  if (items.length === 0) return <p className="border-t border-[#111111]/15 pt-6 text-sm text-[#111111]/50">{empty}</p>;

  return (
    <div onMouseLeave={() => setHover(null)}>
      {fine && !reduced && <CursorPoster item={hover} />}
      <ul className="border-b border-[#111111]/15">
        {items.map((it, i) => {
          const { day, month, year } = eventDateParts(it.eventDate);
          return (
            <motion.li key={it.id}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: Math.min(i, 6) * 0.05, ease: E }}
              className="border-t border-[#111111]/15">
              <a href={it.href} target={it.external ? "_blank" : undefined} rel={it.external ? "noreferrer noopener" : undefined}
                onMouseEnter={() => setHover(it)} onFocus={() => setHover(it)} onBlur={() => setHover(null)}
                className={`group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 transition-colors sm:gap-x-6 lg:grid-cols-[8rem_1fr_11rem_11rem_3rem] ${compact ? "py-4" : "py-6 lg:py-8"}`}>
                <div className="leading-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                  <span className={`block font-black tracking-tight text-[#111111] transition-colors group-hover:text-[#003CD1] ${compact ? "text-3xl" : "text-5xl lg:text-6xl"}`}>{day}</span>
                  <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111111]/50">{month} {year}</span>
                </div>

                <div className="flex min-w-0 items-center gap-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3">
                  {it.imageUrl && !compact && (
                    <img src={it.imageUrl} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg bg-[#111111] object-cover lg:hidden" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003CD1]">{it.tag}</p>
                    <h3 className={`mt-1 text-balance font-black leading-[1.05] tracking-tight text-[#111111] ${compact ? "text-lg" : "text-xl sm:text-2xl lg:text-[2rem]"}`}>{it.title}</h3>
                    <p className="mt-1.5 text-xs text-[#111111]/50 lg:hidden">{it.city}{it.room ? ` · ${it.room.label}` : ""}</p>
                    {it.note && <p className="mt-1.5 text-xs font-bold text-[#003CD1]">{it.note}</p>}
                  </div>
                </div>

                <span className="hidden text-sm font-semibold text-[#111111]/70 lg:block">{it.city}</span>
                <span className="hidden lg:block">
                  {it.room && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#111111]/15 px-3 py-1.5 text-[11px] font-semibold text-[#111111]/75">
                      <span className={`h-2.5 w-2.5 rounded-full ${it.room.swatch}`} />
                      {it.room.label}
                    </span>
                  )}
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-[#111111]/15 text-[#111111] transition duration-300 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-[#C6FF3A]">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </a>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
