"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * "The visibility gap" as a before/after you can drag: the same profile card,
 * neglected on the right and properly built on the left. Drag the handle (or use
 * ←/→ on it) to close the gap. The first time it scrolls into view it nudges
 * itself once so people see it moves.
 */
export function GapSlider() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { once: true, margin: "-120px" });
  const reduced = usePrefersReducedMotion();
  const pos = useMotionValue(50); // % of width revealed on the "built" side
  const [value, setValue] = useState(50);
  const dragging = useRef(false);

  const clip = useMotionTemplate`inset(0 calc(100% - ${pos}%) 0 0)`;
  const handleLeft = useMotionTemplate`${pos}%`;
  const glow = useTransform(pos, [0, 100], [0.15, 0.6]);

  useEffect(() => pos.on("change", (v) => setValue(Math.round(v))), [pos]);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(pos, [50, 18, 78, 50], { duration: 2.4, ease: "easeInOut", times: [0, 0.35, 0.75, 1], delay: 0.4 });
    return () => controls.stop();
  }, [inView, reduced, pos]);

  function setFromPointer(clientX: number) {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    pos.set(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em]">
        <span className="text-accent">What you&rsquo;ve built</span>
        <span className="text-white/40">What the internet sees</span>
      </div>

      <div
        ref={box}
        onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); setFromPointer(e.clientX); }}
        onPointerMove={(e) => { if (dragging.current) setFromPointer(e.clientX); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
        className="relative cursor-ew-resize touch-pan-y overflow-hidden rounded-xl border border-white/10"
      >
        {/* Neglected profile (full width underneath) */}
        <ProfileCard state="neglected" />
        {/* Built profile, clipped to the handle */}
        <motion.div aria-hidden="true" className="absolute inset-0" style={{ clipPath: clip }}>
          <ProfileCard state="built" />
          <motion.div aria-hidden="true" style={{ opacity: glow }} className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        </motion.div>

        {/* Handle */}
        <motion.div style={{ left: handleLeft }} className="absolute inset-y-0 z-20 -ml-px w-0.5 bg-accent shadow-[0_0_24px_4px_rgba(198,255,58,0.45)]">
          <button
            type="button"
            role="slider"
            aria-label="Close the visibility gap"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 20 : 5;
              if (e.key === "ArrowLeft") { e.preventDefault(); pos.set(Math.max(0, pos.get() - step)); }
              if (e.key === "ArrowRight") { e.preventDefault(); pos.set(Math.min(100, pos.get() + step)); }
            }}
            className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-ink shadow-[0_10px_30px_-8px_rgba(0,0,0,0.8)] outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-white/40"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6-6 6 6 6" /><path d="m15 6 6 6-6 6" /></svg>
          </button>
        </motion.div>
      </div>
      <p className="mt-3 text-center text-xs text-white/40">Drag to close the gap</p>
    </div>
  );
}

/** One profile card, drawn twice: properly built, or left to drift. */
function ProfileCard({ state }: { state: "built" | "neglected" }) {
  const built = state === "built";
  return (
    <div className={`relative ${built ? "bg-[#0F1A3D]" : "bg-[#161616]"}`}>
      {/* banner */}
      <div className={`h-28 md:h-36 ${built ? "bg-[linear-gradient(120deg,#003CD1_0%,#1F55E8_45%,#C6FF3A_120%)]" : "bg-[#242424]"}`}>
        {built && (
          <div className="flex h-full items-end justify-end p-4">
            <span className="rounded-full bg-ink/40 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">Clear point of view</span>
          </div>
        )}
      </div>
      <div className="px-5 pb-6 md:px-8 md:pb-8">
        {/* avatar */}
        <div className={`-mt-10 grid h-20 w-20 place-items-center rounded-full border-4 md:-mt-12 md:h-24 md:w-24 ${built ? "border-[#0F1A3D] bg-gradient-to-br from-accent to-[#7FB800] text-ink" : "border-[#161616] bg-[#2b2b2b] text-white/25"}`}>
          {built ? (
            <span className="text-xl font-semibold">You</span>
          ) : (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg>
          )}
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_1.1fr] md:gap-10">
          <div>
            <p className={`text-xl font-semibold ${built ? "text-white" : "text-white/40"}`}>You</p>
            {built ? (
              <p className="mt-1 text-sm text-white/75">Founder · Known for one clear idea · Speaker</p>
            ) : (
              <p className="mt-1 text-sm text-white/30">Founder at —</p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {(built
                ? ["A company worth talking about", "Opinions your industry needs", "Stories that inspire"]
                : ["An inactive profile", "Scattered, occasional posts", "No clear point of view"]
              ).map((t) => (
                <span key={t} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${built ? "bg-accent text-ink" : "border border-dashed border-white/15 text-white/35"}`}>{t}</span>
              ))}
            </div>
          </div>

          {/* activity */}
          <div className={`rounded-xl p-4 ${built ? "bg-white/[0.06]" : "border border-dashed border-white/10"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${built ? "text-white/60" : "text-white/30"}`}>Activity</p>
            {built ? (
              <ul className="mt-3 space-y-2.5">
                {["Founder story · short-form video", "Opinion post · LinkedIn", "Podcast guest appearance"].map((t, i) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md text-[10px] font-semibold ${i === 0 ? "bg-accent text-ink" : "bg-primary text-white"}`}>{i === 0 ? "▶" : i === 1 ? "in" : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>
                    )}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-white/90">{t}</span>
                      <span className="mt-1 block h-1.5 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${88 - i * 18}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-white/35">No recent activity</p>
                {[64, 46, 30].map((w) => <span key={w} className="block h-2 rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
