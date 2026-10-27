"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";

// What a day's slot carries — the formats the one shoot day turns into.
const FORMATS = [
  { tag: "Reel", tone: "bg-accent text-ink" },
  { tag: "in", tone: "bg-white text-primary" },
  { tag: "Short", tone: "bg-[#3D6BFF] text-white" },
  { tag: "IG", tone: "bg-white/90 text-ink" },
  { tag: "YT", tone: "bg-[#0B1640] text-white ring-1 ring-white/20" },
];
const DAYS = 30;

/**
 * "1 day → 1 month", shown literally: a month calendar where only day 1 (the
 * founder shoot) is lit, then — as you scroll — that one day spreads into the
 * whole month, slot by slot, while the steps of the flow tick off alongside.
 */
export function OneDayCalendar({ flow }: { flow: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.55"] });
  const [filled, setFilled] = useState(reduced ? DAYS : 1);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduced) return;
    setFilled(Math.max(1, Math.min(DAYS, Math.round(1 + v * (DAYS - 1)))));
  });
  const done = Math.round((filled / DAYS) * flow.length);

  return (
    <div ref={ref} className="rounded-xl border border-white/15 bg-[#0B1640]/45 p-5 backdrop-blur md:p-7">
      <div className="flex items-end justify-between gap-3 border-b border-white/15 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">Your time</p>
          <p className="mt-1 whitespace-nowrap text-4xl font-black tracking-tight sm:text-5xl">1 day</p>
        </div>
        <svg className="mb-3 h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">Your visibility</p>
          <p className="mt-1 whitespace-nowrap text-4xl font-black tracking-tight sm:text-5xl">
            <span className="tabular-nums text-accent">{filled}</span>
            <span className="text-white/40"> / {DAYS} days</span>
          </p>
        </div>
      </div>

      {/* The month */}
      <div className="mt-5 grid grid-cols-6 gap-1.5 sm:gap-2" role="img" aria-label="One shoot day turns into thirty days of content">
        {Array.from({ length: DAYS }, (_, d) => {
          const lit = d < filled;
          const shoot = d === 0;
          const f = FORMATS[(d * 7) % FORMATS.length];
          return (
            <motion.div
              key={d}
              animate={{ opacity: lit ? 1 : 0.35, scale: lit ? 1 : 0.92 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className={`relative flex aspect-square flex-col justify-between rounded-md p-1.5 sm:p-2 ${shoot ? "bg-accent text-ink" : lit ? "bg-white/[0.08]" : "border border-dashed border-white/10"}`}
            >
              <span className={`text-[10px] font-semibold tabular-nums ${shoot ? "text-ink/70" : "text-white/45"}`}>{d + 1}</span>
              {shoot ? (
                <span className="text-[9px] font-semibold uppercase leading-tight tracking-wide sm:text-[10px]">Shoot</span>
              ) : (
                <motion.span
                  initial={false}
                  animate={{ scale: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className={`self-start rounded px-1 py-px text-[8px] font-semibold leading-tight sm:text-[9px] ${f.tone}`}
                >
                  {f.tag}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* The flow, ticking off */}
      <ol className="mt-6 grid gap-2 sm:grid-cols-2">
        {flow.map((step, i) => {
          const ok = i < Math.max(1, done);
          return (
            <li key={step} className={`flex items-center gap-3 rounded-[6px] px-3.5 py-2.5 text-[14px] transition-colors duration-300 ${ok ? "bg-white/[0.1] text-white" : "bg-white/[0.03] text-white/40"}`}>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors duration-300 ${ok ? "bg-accent text-ink" : "border border-white/20"}`}>
                {ok && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>}
              </span>
              {step}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
