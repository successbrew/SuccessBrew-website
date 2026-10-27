"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

const E = [0.22, 1, 0.36, 1] as const;

/* ── ScrollWords ─────────────────────────────────────────────────────────────
 * A statement read at the reader's pace: every word starts faint and lights up
 * as you scroll past it. Words in `accent` light up lime. */
export function ScrollWords({ text, accent = [], className = "" }: { text: string; accent?: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "end 0.62"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} word={w} index={i} total={words.length} progress={scrollYProgress} lime={accent.includes(w.replace(/[^\w’']/g, ""))} still={!!reduced} />
      ))}
    </p>
  );
}

function Word({ word, index, total, progress, lime, still }: { word: string; index: number; total: number; progress: MotionValue<number>; lime: boolean; still: boolean }) {
  const start = index / total;
  const opacity = useTransform(progress, [start, start + 1.5 / total], [0.14, 1]);
  const y = useTransform(progress, [start, start + 1.5 / total], [6, 0]);
  return (
    <motion.span style={still ? undefined : { opacity, y }} className={`inline-block ${lime ? "text-accent" : ""}`}>
      {word}&nbsp;
    </motion.span>
  );
}

/* ── Polaroid ────────────────────────────────────────────────────────────────
 * A photo print: slight tilt, a strip of tape, drifts against the scroll and
 * leans toward a mouse pointer. */
export function Polaroid({
  src, alt, caption, tilt = -2.5, className = "", imgClassName = "", aspect = "aspect-[4/5]", priority = false,
}: {
  src: string; alt: string; caption?: React.ReactNode; tilt?: number; className?: string; imgClassName?: string; aspect?: string; priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const inner = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      ref={ref}
      style={reduced ? { rotate: tilt } : { y: drift, rotate: tilt, rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => { px.set(0); py.set(0); }}
      className={`relative rounded-[4px] bg-[#F7F3EA] p-3 pb-4 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ${className}`}
    >
      <span aria-hidden="true" className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rotate-[-4deg] bg-accent/55 mix-blend-multiply" />
      <div className={`relative overflow-hidden rounded-[2px] bg-ink ${aspect}`}>
        <motion.img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          style={reduced ? undefined : { y: inner, scale: 1.14 }}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      </div>
      {caption && <div className="px-1 pt-3 text-ink">{caption}</div>}
    </motion.div>
  );
}

/* ── WipeReveal ──────────────────────────────────────────────────────────────
 * A cover image that wipes open diagonally as it scrolls in, with a slow zoom. */
export function WipeReveal({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.45"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  // A slanted edge sweeping left → right: the top runs ahead of the bottom.
  const top = useTransform(p, [0, 1], [0, 100]);
  const bottom = useTransform(p, [0, 1], [-40, 100]);
  const clipPath = useMotionTemplate`polygon(0 0, ${top}% 0, ${bottom}% 100%, 0 100%)`;
  const scale = useTransform(p, [0, 1], [1.18, 1]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={reduced ? undefined : { clipPath }} className="h-full w-full">
        <motion.img src={src} alt={alt} loading="lazy" style={reduced ? undefined : { scale }} className="aspect-video w-full object-cover" />
      </motion.div>
    </div>
  );
}

/* ── MarkerRow ───────────────────────────────────────────────────────────────
 * A list row that a highlighter sweeps across on hover/focus — the way you'd
 * mark the line that matters in a printed doc. */
export function MarkerRow({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <motion.li
      initial="rest"
      whileHover="marked"
      whileFocus="marked"
      whileInView="seen"
      viewport={{ once: true, margin: "-60px" }}
      tabIndex={0}
      className="group relative grid cursor-default grid-cols-[2.5rem_1fr] gap-x-4 overflow-hidden border-b border-white/10 py-8 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid-cols-[3rem_0.8fr_1.2fr] sm:items-baseline"
    >
      <motion.span
        aria-hidden="true"
        variants={{ rest: { scaleX: 0 }, seen: { scaleX: 0 }, marked: { scaleX: 1 } }}
        transition={{ duration: 0.45, ease: E }}
        className="absolute inset-y-3 -left-2 right-0 origin-left -skew-x-6 rounded-sm bg-accent"
      />
      <motion.span variants={{ rest: { opacity: 0, x: -10 }, seen: { opacity: 1, x: 0 }, marked: { opacity: 1, x: 0 } }} className="relative text-sm text-white/35 transition-colors group-hover:text-ink/60 group-focus:text-ink/60">{n}</motion.span>
      <motion.h3 variants={{ rest: { opacity: 0, y: 14 }, seen: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } }, marked: { opacity: 1, y: 0 } }}
        className="relative text-2xl font-black tracking-tight transition-colors md:text-3xl group-hover:text-ink group-focus:text-ink">{title}</motion.h3>
      <motion.p variants={{ rest: { opacity: 0 }, seen: { opacity: 1, transition: { duration: 0.6, delay: 0.15 } }, marked: { opacity: 1 } }}
        className="relative col-start-2 mt-2 text-[17px] text-white/55 transition-colors sm:col-start-3 sm:mt-0 group-hover:text-ink/75 group-focus:text-ink/75">{desc}</motion.p>
    </motion.li>
  );
}
