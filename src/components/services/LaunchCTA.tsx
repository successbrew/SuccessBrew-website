"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const E = [0.22, 1, 0.36, 1] as const;
const BOOKING_URL = "https://ntis.in/7oApLV";

/** The brief, straight from the copy: what we ask you to bring to the call. */
const CHECKLIST = ["What you’re building", "Who needs it", "What a successful launch looks like"];
/** What the call covers — lights up once the countdown hits GO. */
const TOPICS = ["Audience", "Creator strategy", "Campaign scope", "Metrics"];
const COUNTDOWN = ["T−3", "T−2", "T−1", "GO"];

/**
 * Closing CTA as a launch sequence — its own motion language, unlike any other
 * section on the page:
 * - the headline arrives like a departures board, each letter flickering through
 *   characters before it locks;
 * - as you scroll, a pre-launch checklist ticks itself off while a countdown
 *   rolls T−3 → T−2 → T−1 → GO;
 * - at GO a lime launch beam fires up from the horizon, the call topics light
 *   up and the main button arms;
 * - hovering the main button sends a rocket out of it and back round.
 * Reduced motion: everything is shown already checked, at GO, and still.
 */
export function LaunchCTA() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  // Counts down across roughly the first two-thirds of a viewport of scrolling once the section is well in view.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.55", "end 0.95"] });
  const [scrolledStage, setScrolledStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Once ticked, stays ticked — a launch sequence doesn't un-count.
    const next = Math.min(COUNTDOWN.length - 1, Math.floor(v * COUNTDOWN.length));
    setScrolledStage((s) => Math.max(s, next));
  });
  // Reduced motion isn't known on the first (server) render, so derive rather than seed state.
  const stage = reduced ? COUNTDOWN.length - 1 : scrolledStage;
  const go = stage === COUNTDOWN.length - 1;

  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const horizonY = useTransform(pass, [0, 1], [60, -40]);

  return (
    <section ref={ref} id="cta" className="relative overflow-hidden bg-[#070B1C] text-white">
      {/* ── launch pad backdrop ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.07] [mask-image:radial-gradient(ellipse_at_50%_100%,black,transparent_70%)]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        {STARS.map((s, i) => (
          <span key={i} className="absolute h-[2px] w-[2px] rounded-full bg-white motion-safe:animate-[launch-twinkle_4s_ease-in-out_infinite]"
            style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s`, opacity: 0.5 }} />
        ))}
        {/* the horizon: a planet's curve rising as you scroll */}
        <motion.div style={reduced ? undefined : { y: horizonY }}
          className="absolute left-[-40%] top-[58%] aspect-square w-[180%] rounded-full bg-[radial-gradient(circle_at_50%_0%,#2A5BFF_0%,#003CD1_8%,#0B1640_26%,transparent_45%)] shadow-[0_-30px_80px_-20px_rgba(61,107,255,0.45)] md:left-[-15%] md:w-[130%]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        {/* the launch beam, fired at GO */}
        <motion.div
          initial={false}
          animate={go ? { scaleY: 1, opacity: [0, 1, 0.55] } : { scaleY: 0, opacity: 0 }}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 right-[22%] hidden h-full w-[3px] origin-bottom bg-gradient-to-t from-accent via-accent/60 to-transparent shadow-[0_0_40px_8px_rgba(198,255,58,0.35)] lg:block"
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:px-10 lg:py-32">
        {/* ── left: the ask ── */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Let&apos;s build</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Launch window open
            </span>
          </div>

          <h2 aria-label="Let’s plan your next product launch." className="mt-6 text-balance text-[clamp(2.6rem,6vw,5.25rem)] font-black leading-[0.98] tracking-tight">
            <BoardText text="Let’s plan your next" />{" "}
            <span className="text-accent"><BoardText text="product launch." delay={0.55} /></span>
          </h2>

          <p className="mt-8 max-w-xl text-lg text-white/70">
            Tell us what you&apos;re building, who needs it and what a successful launch would look like.
          </p>
          <p className="mt-4 max-w-xl text-lg text-white/70">
            We&apos;ll discuss the audience, creator strategy, campaign scope and metrics that make sense for your product.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <RocketButton armed={go} />
            <a href="#work" className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-base font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/5">
              See the work
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
          <p className="mt-6 max-w-xl text-sm text-white/50">
            No generic marketing pitch. A focused conversation about your product and its route to market.
          </p>
        </div>

        {/* ── right: the pre-launch console ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: E }}
          className="relative rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md md:p-8"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45">Pre-launch checklist</p>
              <p className="mt-1 text-sm text-white/70">Bring these to the call.</p>
            </div>
            <div className="relative h-12 w-24 overflow-hidden text-right" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={stage}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  className={`absolute inset-0 text-4xl font-black tabular-nums tracking-tight ${go ? "text-accent" : "text-white"}`}
                >
                  {COUNTDOWN[stage]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <ol className="mt-6 space-y-2.5">
            {CHECKLIST.map((item, i) => {
              const done = stage > i || go;
              return (
                <motion.li key={item}
                  animate={{ backgroundColor: done ? "rgba(198,255,58,0.10)" : "rgba(255,255,255,0.03)", borderColor: done ? "rgba(198,255,58,0.35)" : "rgba(255,255,255,0.08)" }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-4 rounded-lg border px-4 py-3.5">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${done ? "border-accent bg-accent text-ink" : "border-white/25 text-white/40"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <motion.path d="M20 6 9 17l-5-5" initial={false} animate={{ pathLength: done ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut" }} />
                    </svg>
                  </span>
                  <span className={`text-[15px] font-semibold transition-colors duration-300 ${done ? "text-white" : "text-white/55"}`}>{item}</span>
                  <span className="ml-auto text-xs tabular-nums text-white/35">0{i + 1}</span>
                </motion.li>
              );
            })}
          </ol>

          <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" initial={false}
              animate={{ width: `${(stage / (COUNTDOWN.length - 1)) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45">On the call</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TOPICS.map((t, i) => (
              <motion.li key={t}
                initial={false}
                animate={go ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.35, y: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 20, delay: go && !reduced ? 0.25 + i * 0.08 : 0 }}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${go ? "border-accent/50 text-accent" : "border-white/15 text-white/60"}`}>
                {t}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

// Fixed star positions (no randomness, so server and client match).
const STARS = Array.from({ length: 26 }, (_, i) => ({
  x: Math.round(((i * 37.7) % 100) * 10) / 10,
  y: Math.round(((i * 23.3) % 62) * 10) / 10,
  d: Math.round(((i * 0.77) % 4) * 100) / 100,
}));

/* ── BoardText ───────────────────────────────────────────────────────────────
 * Departures-board arrival: each letter flickers through characters, then
 * locks, left to right. Screen readers get the real text from the heading's
 * aria-label; the flicker is aria-hidden. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/+";

function BoardText({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!inView || reduced) return;
    const start = performance.now() + delay * 1000;
    const perChar = 38; // ms between letters locking
    const flicker = 260; // how long each letter flickers before locking
    let frame = 0;
    const tick = (now: number) => {
      const t = now - start;
      let done = true;
      const out = text.split("").map((ch, i) => {
        if (ch === " ") return " ";
        const lockAt = i * perChar + flicker;
        if (t >= lockAt) return ch;
        done = false;
        return t < i * perChar - 120 ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      });
      setShown(out.join(""));
      if (!done) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, text, delay]);

  return (
    <span ref={ref} aria-hidden="true" className="whitespace-pre-wrap">
      {shown}
    </span>
  );
}

/* ── RocketButton ────────────────────────────────────────────────────────────
 * The main CTA. Arms (a one-time pulse) when the countdown hits GO; on hover a
 * rocket blasts out of the button and comes back round from below. */
function RocketButton({ armed }: { armed: boolean }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.a
      href={BOOKING_URL}
      initial="rest"
      animate={armed ? "armed" : "rest"}
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      variants={{
        rest: { boxShadow: "0 10px 30px -10px rgba(198,255,58,0.35)" },
        armed: { boxShadow: ["0 10px 30px -10px rgba(198,255,58,0.35)", "0 0 0 10px rgba(198,255,58,0.18)", "0 10px 34px -8px rgba(198,255,58,0.65)"], transition: { duration: 1.2 } },
        hover: { y: -2 },
      }}
      className="relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-accent py-4 pl-7 pr-5 text-base font-semibold text-ink"
    >
      Book a Product Launch Strategy Call
      <span aria-hidden="true" className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-ink text-accent">
        <motion.span
          className="absolute inset-0 grid place-items-center"
          variants={reduced ? {} : {
            rest: { y: 0, x: 0, opacity: 1 },
            armed: { y: 0, x: 0, opacity: 1 },
            hover: { y: [0, 2, -40, 40, 0], x: [0, -1, 6, -6, 0], opacity: [1, 1, 1, 0, 1], transition: { duration: 0.9, times: [0, 0.15, 0.5, 0.51, 1], ease: "easeInOut" } },
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        </motion.span>
      </span>
    </motion.a>
  );
}
