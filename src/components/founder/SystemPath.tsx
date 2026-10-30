"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type Stage = { key: string; question: string; detail: string };

// Node positions on the 1000×140 drawing: one per column centre, wandering up and down like a hand-drawn line.
const NODES = [
  { x: 100, y: 78 },
  { x: 300, y: 40 },
  { x: 500, y: 92 },
  { x: 700, y: 46 },
  { x: 900, y: 70 },
];
const PATH = "M 0 96 C 40 92, 70 80, 100 78 S 240 36, 300 40 S 430 96, 500 92 S 640 40, 700 46 S 850 76, 900 70 S 980 52, 1000 50";

/**
 * The five-stage system as a pen line that draws itself across the page as you
 * scroll; each stage switches on when the line reaches it. Phones get the same
 * idea on a vertical rail.
 */
export function SystemPath({ stages }: { stages: Stage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });
  const [reached, setReached] = useState(reduced ? stages.length : 0);

  useMotionValueEvent(drawn, "change", (v) => {
    if (reduced) return;
    // Node i sits at x = 0.1 + 0.2i of the line.
    setReached(stages.filter((_, i) => v >= 0.1 + i * 0.2 - 0.04).length);
  });

  return (
    <div ref={ref} className="relative mt-16">
      {/* Desktop: the drawn line with nodes */}
      <div className="relative hidden h-[140px] lg:block" aria-hidden="true">
        <svg viewBox="0 0 1000 140" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <path d={PATH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="3 9" />
          <motion.path d={PATH} fill="none" stroke="url(#sys-pen)" strokeWidth="3" strokeLinecap="round" style={{ pathLength: reduced ? 1 : drawn }} />
          <defs>
            <linearGradient id="sys-pen" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#003CD1" />
              <stop offset="0.7" stopColor="#3D6BFF" />
              <stop offset="1" stopColor="#C6FF3A" />
            </linearGradient>
          </defs>
        </svg>
        {NODES.slice(0, stages.length).map((n, i) => {
          const on = i < reached;
          const last = i === stages.length - 1;
          return (
            <motion.span
              key={i}
              className={`absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-sm font-semibold ring-[6px] ring-[#0B0B0B] ${last ? "bg-accent text-ink" : "bg-primary text-white"}`}
              style={{ left: `${n.x / 10}%`, top: `${(n.y / 140) * 100}%` }}
              animate={{ scale: on ? 1 : 0.4, opacity: on ? 1 : 0.25 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
            >
              0{i + 1}
            </motion.span>
          );
        })}
      </div>

      {/* Stage notes */}
      <ol className="relative grid gap-10 lg:mt-6 lg:grid-cols-5 lg:gap-6">
        {/* phone rail */}
        <span aria-hidden="true" className="absolute bottom-2 left-[19px] top-2 w-px bg-white/10 lg:hidden" />
        <motion.span aria-hidden="true" style={{ scaleY: reduced ? 1 : drawn }} className="absolute bottom-2 left-[19px] top-2 w-px origin-top bg-gradient-to-b from-primary to-accent lg:hidden" />
        {stages.map((s, i) => {
          const on = i < reached;
          const last = i === stages.length - 1;
          return (
            <motion.li
              key={s.key}
              animate={{ opacity: on ? 1 : 0.3, y: on ? 0 : 14 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative pl-14 lg:pl-0 lg:text-center"
            >
              <span className={`absolute left-0 top-0 z-10 grid h-10 w-10 place-items-center rounded-full text-sm font-semibold ring-4 ring-[#0B0B0B] lg:hidden ${last ? "bg-accent text-ink" : "bg-primary text-white"}`}>
                0{i + 1}
              </span>
              <h3 className={`text-2xl font-black uppercase tracking-tight ${last ? "text-accent" : "text-white"}`}>{s.key}</h3>
              <p className="mt-2 text-[17px] font-semibold leading-snug text-white/90">{s.question}</p>
              <p className="mt-3 text-sm text-white/50">{s.detail}</p>
              {last && (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
                  → Opportunity
                </p>
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
