"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Hand-drawn marks — the "a person made this" layer of the founder page.
 * Each is a deliberately imperfect SVG stroke that draws itself in (pathLength)
 * the first time it scrolls into view, the way a pen would. They're decoration:
 * aria-hidden, pointer-events-none, and fully drawn for reduced-motion visitors.
 */

type Tone = "lime" | "blue" | "white";
const STROKE: Record<Tone, string> = { lime: "#C6FF3A", blue: "#3D6BFF", white: "rgba(255,255,255,0.85)" };

function useDraw(delay = 0, duration = 0.9) {
  const reduced = useReducedMotion();
  return {
    initial: { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "-80px" },
    transition: { pathLength: { duration, ease: [0.65, 0, 0.35, 1] as const, delay }, opacity: { duration: 0.01, delay } },
  };
}

/** A loose pen circle around a word or phrase. */
export function Circled({ children, tone = "lime", delay = 0.3 }: { children: React.ReactNode; tone?: Tone; delay?: number }) {
  const draw = useDraw(delay, 1.1);
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <svg aria-hidden="true" viewBox="0 0 300 120" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-[9%] -inset-y-[22%] h-[144%] w-[118%] overflow-visible">
        <motion.path
          d="M 158 14 C 96 6, 22 18, 12 58 C 3 96, 88 112, 168 108 C 246 104, 296 84, 288 50 C 281 18, 214 4, 128 10 C 96 12, 72 18, 60 24"
          fill="none" stroke={STROKE[tone]} strokeWidth="4" strokeLinecap="round"
          {...draw}
        />
      </svg>
    </span>
  );
}

/** A quick scribbled underline (two passes, like someone underlined it twice). */
export function Scribble({ children, tone = "lime", delay = 0.25 }: { children: React.ReactNode; tone?: Tone; delay?: number }) {
  const first = useDraw(delay, 0.6);
  const second = useDraw(delay + 0.45, 0.5);
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <svg aria-hidden="true" viewBox="0 0 300 30" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-[0.18em] left-[-2%] h-[0.42em] w-[104%] overflow-visible">
        <motion.path d="M 4 18 C 60 10, 140 8, 296 12" fill="none" stroke={STROKE[tone]} strokeWidth="5" strokeLinecap="round" {...first} />
        <motion.path d="M 22 24 C 110 18, 200 19, 282 22" fill="none" stroke={STROKE[tone]} strokeWidth="3.5" strokeLinecap="round" {...second} />
      </svg>
    </span>
  );
}

/** A hand strike-through, slightly uphill. */
export function Struck({ children, tone = "white", delay = 0.4 }: { children: React.ReactNode; tone?: Tone; delay?: number }) {
  const draw = useDraw(delay, 0.55);
  return (
    <span className="relative inline-block">
      {children}
      <svg aria-hidden="true" viewBox="0 0 300 40" preserveAspectRatio="none" className="pointer-events-none absolute left-[-4%] top-[30%] h-[40%] w-[108%] overflow-visible">
        <motion.path d="M 4 30 C 90 24, 190 16, 296 8" fill="none" stroke={STROKE[tone]} strokeWidth="4" strokeLinecap="round" {...draw} />
      </svg>
    </span>
  );
}

/** A curly doodle arrow, e.g. pointing from a note to a photo. */
export function DoodleArrow({ className = "", tone = "lime", delay = 0.6, flip = false }: { className?: string; tone?: Tone; delay?: number; flip?: boolean }) {
  const shaft = useDraw(delay, 0.8);
  const head = useDraw(delay + 0.7, 0.3);
  return (
    <svg aria-hidden="true" viewBox="0 0 120 90" className={`pointer-events-none overflow-visible ${className}`} style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <motion.path d="M 8 12 C 40 4, 70 18, 62 42 C 56 60, 34 52, 44 38 C 54 24, 92 40, 106 74" fill="none" stroke={STROKE[tone]} strokeWidth="3" strokeLinecap="round" {...shaft} />
      <motion.path d="M 92 70 L 107 76 L 110 60" fill="none" stroke={STROKE[tone]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...head} />
    </svg>
  );
}

/** Film-grain overlay so the dark sections feel like paper/print rather than flat screen. */
export function Grain({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}
