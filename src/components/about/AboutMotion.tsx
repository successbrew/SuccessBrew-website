"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ArrowUpRight } from "lucide-react";

const E = [0.22, 1, 0.36, 1] as const;

/* ── Scroll-lit paragraph ───────────────────────────────────────────────── */

function LitWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

/** Words brighten from dim to full as the passage scrolls through the
 * viewport, so the story is read at the reader's own pace. */
export function ScrollWords({ paragraphs, className = "" }: { paragraphs: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.45"] });
  const words = paragraphs.flatMap((p, pi) => p.split(" ").map((w) => ({ w, pi })));
  const total = words.length;

  if (reduced) {
    return <div className={className}>{paragraphs.map((p) => <p key={p} className="mb-[0.6em]">{p}</p>)}</div>;
  }
  let k = 0;
  return (
    <div ref={ref} className={className}>
      {paragraphs.map((_, pi) => (
        <p key={pi} className="mb-[0.6em]">
          {words.filter((x) => x.pi === pi).map((x) => {
            const i = k++;
            return <LitWord key={i} word={x.w} progress={scrollYProgress} range={[i / total, Math.min(1, (i + 3) / total)]} />;
          })}
        </p>
      ))}
    </div>
  );
}

/* ── Pinned horizontal journey ─────────────────────────────────────────── */

export interface Milestone { year: string; title: string; desc: string }

/** The years slide past horizontally while the section is pinned; vertical
 * scroll drives it, so nothing hijacks the wheel. Below lg — or with reduced
 * motion — it's a plain vertical list. */
export function JourneyRail({ milestones, photos }: { milestones: Milestone[]; photos: { src: string; alt: string }[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [wide, setWide] = useState(false);
  const [dist, setDist] = useState(0);
  const distMV = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * distMV.get());
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Decide the layout first, then measure the horizontal track once it exists.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches && !reduced);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduced]);

  useEffect(() => {
    if (!wide) { distMV.set(0); return; }
    const measure = () => {
      const d = track.current ? Math.max(0, track.current.scrollWidth - window.innerWidth) : 0;
      distMV.set(d);
      setDist(d);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [wide, distMV]);

  const horizontal = wide;
  // Interleave a photo after every second milestone.
  const items: ({ kind: "m"; m: Milestone; i: number } | { kind: "p"; p: { src: string; alt: string } })[] = [];
  milestones.forEach((m, i) => {
    items.push({ kind: "m", m, i });
    if (i % 2 === 1 && photos[(i - 1) / 2]) items.push({ kind: "p", p: photos[(i - 1) / 2] });
  });

  return (
    <section ref={section} style={horizontal && dist > 0 ? { height: `calc(100vh + ${dist}px)` } : undefined} className="relative bg-[#0B0B0B]">
      <div className={horizontal ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-24"}>
        <div className="mx-auto mb-10 w-full max-w-7xl px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">02 — The journey</p>
          <h2 className="mt-4 max-w-3xl text-balance text-[clamp(2.25rem,4.6vw,4.25rem)] font-black leading-[1] tracking-tight">From 30 people in a room to an ecosystem.</h2>
        </div>
        <motion.div ref={track} style={horizontal ? { x } : undefined}
          className={horizontal ? "flex w-max items-stretch gap-6 pl-[max(1.5rem,calc((100vw-80rem)/2+2.5rem))] pr-[10vw]" : "mx-auto grid max-w-7xl gap-5 px-6 sm:grid-cols-2 lg:px-10"}>
          {items.map((it, k) =>
            it.kind === "m" ? (
              <article key={k} className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-8 ${horizontal ? "h-[52vh] min-h-[340px] w-[380px]" : ""} ${it.i === milestones.length - 1 ? "border-accent/40 bg-accent text-ink" : "border-white/10 bg-white/[0.03]"}`}>
                <span className={`select-none text-[7rem] font-black leading-none tracking-tighter text-transparent ${it.i === milestones.length - 1 ? "[-webkit-text-stroke:1.5px_#111111]" : "[-webkit-text-stroke:1.5px_rgba(255,255,255,0.35)]"}`}>{it.m.year}</span>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{it.m.title}</h3>
                  <p className={`mt-3 text-[15px] leading-relaxed ${it.i === milestones.length - 1 ? "text-ink/70" : "text-white/55"}`}>{it.m.desc}</p>
                </div>
              </article>
            ) : (
              <div key={k} className={`relative overflow-hidden rounded-3xl ${horizontal ? "h-[52vh] min-h-[340px] w-[480px]" : "aspect-[4/3]"}`}>
                <Image src={it.p.src} alt={it.p.alt} fill sizes="480px" className="object-cover" />
              </div>
            )
          )}
        </motion.div>
        {horizontal && (
          <div className="mx-auto mt-10 w-full max-w-7xl px-6 lg:px-10">
            <div className="h-px bg-white/10"><motion.div style={{ scaleX: bar }} className="h-px origin-left bg-gradient-to-r from-primary to-accent" /></div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Growth chart ──────────────────────────────────────────────────────── */

const GROWTH = [
  { year: 2019, n: 30, label: "30" },
  { year: 2021, n: 500, label: "500" },
  { year: 2022, n: 2000, label: "2,000" },
  { year: 2026, n: 8000, label: "8,000+" },
];
const GOAL = { year: 2030, n: 1_000_000, label: "1M" };

/** Community size on a log scale — real numbers to today, a dashed line to the
 * 2030 goal. Draws itself when scrolled into view. */
export function GrowthChart() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = usePrefersReducedMotion();
  const W = 1000, H = 440, L = 70, R = 40, T = 50, B = 50;
  const X = (y: number) => L + ((y - 2018) / (2030 - 2018)) * (W - L - R);
  const Y = (n: number) => T + (1 - (Math.log10(n) - 1) / 5) * (H - T - B);
  const real = GROWTH.map((g, i) => `${i ? "L" : "M"}${X(g.year)},${Y(g.n)}`).join(" ");
  const last = GROWTH[GROWTH.length - 1];
  const proj = `M${X(last.year)},${Y(last.n)} L${X(GOAL.year)},${Y(GOAL.n)}`;
  const area = `${real} L${X(last.year)},${H - B} L${X(GROWTH[0].year)},${H - B} Z`;
  const show = inView || !!reduced;
  const tr = (d: number, dur = 1.4) => (reduced ? { duration: 0 } : { duration: dur, delay: d, ease: E });

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
      aria-label="Successbrew community growth: 30 members in 2019, 500 in 2021, 2,000 in 2022, over 8,000 today, aiming for 1 million by 2030.">
      <defs>
        <linearGradient id="growth-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#003CD1" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#003CD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="growth-line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#3D6BFF" />
          <stop offset="100%" stopColor="#C6FF3A" />
        </linearGradient>
      </defs>
      {[10, 100, 1000, 10_000, 100_000, 1_000_000].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={Y(g)} y2={Y(g)} stroke="white" strokeOpacity="0.08" />
          <text x={L - 14} y={Y(g) + 4} textAnchor="end" fill="white" fillOpacity="0.35" fontSize="12">{g >= 1_000_000 ? "1M" : g >= 1000 ? `${g / 1000}K` : g}</text>
        </g>
      ))}
      {[2019, 2022, 2026, 2030].map((y) => (
        <text key={y} x={X(y)} y={H - 18} textAnchor="middle" fill="white" fillOpacity="0.35" fontSize="12">{y}</text>
      ))}
      <motion.path d={area} fill="url(#growth-area)" initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : undefined} transition={tr(0.9, 0.8)} />
      <motion.path d={real} fill="none" stroke="url(#growth-line)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={tr(0)} />
      <motion.path d={proj} fill="none" stroke="#C6FF3A" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round"
        initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : undefined} transition={tr(1.4, 0.6)} />
      {[...GROWTH, GOAL].map((g, i) => {
        const goal = g === GOAL;
        return (
          <motion.g key={g.year} initial={{ opacity: 0, scale: 0.4 }} animate={show ? { opacity: 1, scale: 1 } : undefined}
            transition={tr(goal ? 1.9 : (i / (GROWTH.length - 1)) * 1.3, 0.4)} style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}>
            <circle cx={X(g.year)} cy={Y(g.n)} r={goal ? 9 : 6} fill={goal ? "#C6FF3A" : "#0B0B0B"} stroke={goal ? "#C6FF3A" : "#3D6BFF"} strokeWidth="3" />
            <text x={X(g.year)} y={Y(g.n) - 18} textAnchor="middle" fill={goal ? "#C6FF3A" : "white"} fontSize={goal ? 20 : 15} fontWeight="600">{g.label}</text>
          </motion.g>
        );
      })}
    </svg>
  );
}

/* ── Ecosystem orbit ───────────────────────────────────────────────────── */

export interface EcosystemNode { title: string; desc: string; href: string; cta: string }

/** Successbrew at the core with its four arms around it. Hover/focus a node to
 * light its link and read about it in the panel. */
export function EcosystemOrbit({ nodes }: { nodes: EcosystemNode[] }) {
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  // Side nodes sit a little inside the ring so their labels never run off a phone screen.
  const pos = [{ x: 50, y: 8 }, { x: 88, y: 50 }, { x: 50, y: 92 }, { x: 12, y: 50 }];
  const a = nodes[active];

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
      <div className="relative mx-auto aspect-square w-full max-w-[520px]">
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="0.3" />
          {pos.slice(0, nodes.length).map((p, i) => (
            <line key={i} x1="50" y1="50" x2={p.x} y2={p.y} stroke={i === active ? "#C6FF3A" : "white"} strokeOpacity={i === active ? 0.9 : 0.12}
              strokeWidth={i === active ? 0.5 : 0.3} strokeDasharray={i === active ? "1.5 1.5" : undefined}
              className={i === active && !reduced ? "[animation:orbit-flow_1.2s_linear_infinite]" : ""} />
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 grid h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-primary to-[#0B1640] text-center shadow-[0_0_80px_-10px_rgba(0,60,209,0.9)]">
          <span className="text-sm font-black leading-tight sm:text-base">Success<br />brew</span>
        </div>
        {nodes.map((n, i) => (
          <button key={n.title} type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} aria-pressed={i === active}
            style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold sm:px-4 sm:py-2.5 sm:text-sm transition-all duration-300 ${i === active ? "scale-110 border-accent bg-accent text-ink shadow-[0_0_40px_-6px_rgba(198,255,58,0.8)]" : "border-white/15 bg-[#111111] text-white/75 hover:text-white"}`}>
            {n.title}
          </button>
        ))}
      </div>

      <motion.div key={a.title} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E }}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">0{active + 1} / 0{nodes.length}</p>
        <h3 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{a.title}</h3>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-white/60">{a.desc}</p>
        <Link href={a.href} className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition hover:border-accent hover:bg-accent hover:text-ink">
          {a.cta} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  );
}

/* ── Parallax gallery ──────────────────────────────────────────────────── */

function Column({ photos, progress, range, className = "" }: { photos: { src: string; alt: string }[]; progress: MotionValue<number>; range: [number, number]; className?: string }) {
  const y = useTransform(progress, [0, 1], range);
  return (
    <motion.div style={{ y }} className={`flex flex-col gap-4 ${className}`}>
      {photos.map((p) => (
        <div key={p.src} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
          <Image src={p.src} alt={p.alt} fill sizes="(max-width:768px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
      ))}
    </motion.div>
  );
}

/** Three columns drifting at different speeds as you scroll past. */
export function ParallaxGallery({ photos }: { photos: { src: string; alt: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const cols = [photos.filter((_, i) => i % 3 === 0), photos.filter((_, i) => i % 3 === 1), photos.filter((_, i) => i % 3 === 2)];
  const amp = reduced ? 0 : 1;
  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <Column photos={cols[0]} progress={scrollYProgress} range={[60 * amp, -60 * amp]} />
      <Column photos={cols[1]} progress={scrollYProgress} range={[-40 * amp, 120 * amp]} className="mt-16" />
      <Column photos={cols[2]} progress={scrollYProgress} range={[100 * amp, -100 * amp]} className="hidden md:flex" />
    </div>
  );
}

/* ── "We don't build products" statement ──────────────────────────────── */

/** A strike draws through "products." and "people." lights up as the
 * statement scrolls into the middle of the screen. */
export function StrikeStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "center 0.5"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const strike = useTransform(p, [0.1, 0.6], [0, 1]);
  const glow = useTransform(p, [0.5, 1], [0.25, 1]);
  return (
    <div ref={ref} className="text-[clamp(3rem,9vw,8.5rem)] font-black leading-[0.95] tracking-tight">
      <p className="text-white/30">We don&rsquo;t build</p>
      <p className="relative inline-block">
        products.
        <motion.span aria-hidden style={{ scaleX: reduced ? 1 : strike }} className="absolute inset-x-[-2%] top-[55%] h-[0.08em] origin-left rounded-full bg-accent" />
      </p>
      <p className="text-white/30">We build</p>
      <motion.p style={{ opacity: reduced ? 1 : glow }} className="bg-gradient-to-r from-[#3D6BFF] via-[#8FB0FF] to-accent bg-clip-text text-transparent">people.</motion.p>
    </div>
  );
}
