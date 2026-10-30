/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { AnimatedNumber } from "@/components/AnimatedNumber";

const E = [0.22, 1, 0.36, 1] as const;

/** Soft lime/blue light that trails the pointer across its parent section.
 * Fine pointers only, transform-only, and absent under reduced motion. */
export function CursorGlow() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 80, damping: 20, mass: 0.6 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    };
    const enter = (e: PointerEvent) => {
      move(e);
      sx.jump(x.get());
      sy.jump(y.get());
      setActive(true);
    };
    const leave = () => setActive(false);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
    };
  }, [reduced, x, y, sx, sy]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        style={{ x: sx, y: sy }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute left-0 top-0 -ml-[280px] -mt-[280px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(198,255,58,0.32)_0%,rgba(0,60,209,0.10)_42%,transparent_68%)]"
      />
    </div>
  );
}

/** Hero stat tile: the number counts up as it lands and a single highlight
 * sweeps across the tile — once, not on a loop. */
export function StatCard({ num, label, sub, bg, subColor, index }: {
  num: string; label: string; sub: string; bg: string; subColor: string; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div ref={ref}
      variants={{ hidden: { opacity: 0, y: 18, scale: 0.94 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: E } } }}
      whileHover={{ scale: 1.02, transition: { duration: 0.25, ease: E } }}
      className={`relative w-[calc(50%-8px)] cursor-default overflow-hidden rounded-3xl border border-[#111111]/5 p-6 text-center shadow-[0_8px_32px_-8px_rgba(0,0,0,0.14)] sm:w-44 md:w-48 ${bg}`}>
      <div className="text-3xl font-black tabular-nums tracking-tight sm:text-4xl"><AnimatedNumber value={num} inView={inView} /></div>
      <div className="mt-2 text-sm font-bold">{label}</div>
      <div className={`mt-1 text-[11px] font-medium ${subColor}`}>{sub}</div>
      <div aria-hidden className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      {!reduced && (
        <motion.span aria-hidden
          initial={{ x: "-160%" }}
          animate={inView ? { x: "260%" } : undefined}
          transition={{ duration: 1.1, delay: 0.5 + index * 0.12, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
      )}
    </motion.div>
  );
}

/** "Our Why" milestones: the rail draws left → right and each year lights up
 * as the line reaches it; the 2030 goal gets one ring pulse on arrival. */
export function WhyTimeline({ steps }: { steps: [string, string][] }) {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = usePrefersReducedMotion();
  const draw = reduced ? 0 : 1.6;
  const last = steps.length - 1;

  return (
    <ol ref={ref} className="relative grid gap-0" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      <div aria-hidden className="absolute left-0 right-0 top-[18px] h-px bg-white/15 sm:top-6" />
      <motion.div aria-hidden
        initial={{ scaleX: reduced ? 1 : 0 }} animate={inView ? { scaleX: 1 } : undefined}
        transition={{ duration: draw, ease: [0.65, 0, 0.35, 1] }}
        className="absolute left-0 right-0 top-[18px] h-px origin-left bg-gradient-to-r from-white/40 via-white/60 to-[#C6FF3A] sm:top-6" />
      {steps.map(([yr, lbl], i) => {
        const goal = i === last;
        const at = reduced ? 0 : (i / last) * draw;
        return (
          <li key={yr} className="relative text-center">
            {goal && !reduced && (
              <motion.span aria-hidden
                initial={{ scale: 1, opacity: 0 }}
                animate={inView ? { scale: [1, 1.9], opacity: [0.7, 0] } : undefined}
                transition={{ duration: 1.1, delay: at + 0.15, ease: "easeOut" }}
                className="absolute left-1/2 top-0 -ml-[18px] h-9 w-9 rounded-full border-2 border-[#C6FF3A] sm:-ml-6 sm:h-12 sm:w-12" />
            )}
            <motion.div
              initial={reduced ? false : { scale: 0.7, opacity: 0.35 }}
              animate={inView ? { scale: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.45, delay: at, ease: E }}
              className={`relative z-10 mx-auto grid h-9 w-9 place-items-center rounded-full border text-xs font-bold sm:h-12 sm:w-12 sm:text-sm ${goal ? "border-[#C6FF3A] bg-[#C6FF3A] text-[#111111]" : "border-white/30 bg-[#003CD1] text-white"}`}>
              {yr}
            </motion.div>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: at + 0.1, ease: E }}
              className={`mt-2 text-[9px] font-bold leading-tight sm:mt-3 sm:text-xs ${goal ? "text-[#C6FF3A]" : "text-white/60"}`}>
              {lbl}
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}

export interface ResourceItem {
  type: string; count: string; desc: string; icon: string; bg: string; countColor: string;
  /** Set once the format has a live page; otherwise the card says "Coming Soon". */
  href?: string;
}

/** Learning Hub as an accordion row: on desktop the selected format widens and
 * reveals its description while the rest fold into narrow spines (hover, focus
 * or the tabs choose it). Below lg it's a plain grid with everything visible. */
export function ResourceAccordion({ resources }: { resources: ResourceItem[] }) {
  const [active, setActive] = useState(resources[0]?.type ?? "");
  const reduced = usePrefersReducedMotion();

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Resource formats">
        {resources.map((r) => (
          <button key={r.type} type="button" aria-pressed={active === r.type} onClick={() => setActive(r.type)}
            className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active === r.type ? "border-transparent text-white" : "border-[#111111]/15 bg-white text-[#111111]/70 hover:border-[#111111]/30 hover:text-[#111111]"}`}>
            {active === r.type && (
              <motion.span layoutId="resource-tab" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                className="glow-blue absolute inset-0 rounded-full bg-gradient-to-r from-primary to-[#1F55E8]" />
            )}
            <span className="relative">{r.type}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:flex lg:h-[330px] lg:gap-4">
        {resources.map((r, i) => {
          const on = active === r.type;
          return (
            <motion.div key={r.type}
              initial={reduced ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.09, ease: E } }}
              viewport={{ once: true, margin: "-60px" }}
              animate={{ flexGrow: on ? 2.4 : 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.55, ease: E }}
              onMouseEnter={() => setActive(r.type)} onFocus={() => setActive(r.type)} onClick={() => setActive(r.type)}
              tabIndex={0}
              className={`relative flex min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-7 outline-none lg:basis-0 lg:p-6 ${r.bg} ${on ? "ring-2 ring-[#003CD1] ring-offset-2 ring-offset-[#F2ECDD]" : ""}`}>
              <span aria-hidden className={`pointer-events-none absolute -bottom-6 -right-2 text-[7rem] leading-none transition-all duration-500 ${on ? "opacity-20" : "opacity-0"}`}>{r.icon}</span>
              <div className="relative">
                <div className="text-3xl">{r.icon}</div>
                <h3 className="mt-4 truncate text-lg font-black">{r.type}</h3>
                <p className={`mt-0.5 text-2xl font-black ${r.countColor}`}>{r.count}</p>
                <p className={`mt-3 text-sm leading-7 opacity-70 transition-opacity duration-300 lg:w-[16rem] ${on ? "lg:opacity-70 lg:delay-200" : "lg:opacity-0"}`}>{r.desc}</p>
              </div>
              {r.href ? (
                <Link href={r.href}
                  className={`group/cta relative mt-6 inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-[#C6FF3A] px-4 py-2 text-sm font-bold text-[#111111] transition hover:bg-white ${on ? "" : "lg:pointer-events-none lg:opacity-0"}`}>
                  Read the {r.type.toLowerCase()} <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
                </Link>
              ) : (
                <span className={`relative mt-6 inline-flex w-fit items-center gap-2 whitespace-nowrap text-sm font-bold transition-opacity ${r.countColor} ${on ? "" : "lg:opacity-0"}`}>
                  Coming Soon...
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

/** Overlapping member avatars that pop in one after another, ending in a
 * "+8,000" bubble — a quick visual of "already inside". */
export function InsideAvatars({ people }: { people: { name: string; initial: string; avatarUrl?: string | null }[] }) {
  const reduced = usePrefersReducedMotion();
  const shown = people.slice(0, 6);
  if (shown.length === 0) return null;
  const pop = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, scale: 0.4, x: -10 },
    visible: { opacity: 1, scale: 1, x: 0, transition: { type: "spring" as const, stiffness: 420, damping: 22 } },
  };

  return (
    <motion.div variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} className="flex items-center justify-center">
      {shown.map((p, i) => (
        <motion.span key={p.name + i} variants={pop} title={p.name}
          className={`${i ? "-ml-3" : ""} grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#111111] text-sm font-bold ${["bg-[#003CD1] text-white", "bg-[#FFF3D0] text-[#111111]", "bg-white text-[#003CD1]"][i % 3]}`}>
          {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" /> : p.initial}
        </motion.span>
      ))}
      <motion.span variants={pop}
        className="-ml-3 grid h-11 shrink-0 place-items-center rounded-full border-2 border-[#111111] bg-[#C6FF3A] px-3 text-xs font-black text-[#111111]">
        +8,000
      </motion.span>
    </motion.div>
  );
}
