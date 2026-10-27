"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { WordReveal } from "@/components/WordReveal";
import { getSmoothScroll } from "@/components/SmoothScroll";


/** Card faces, in order — the deck ends on the brand blue. */
const FACES = [
  { card: "bg-background text-ink border-ink/10", body: "text-ink/65", badge: "bg-ink text-white", tag: "text-primary" },
  { card: "bg-sand text-ink border-ink/10", body: "text-ink/65", badge: "bg-primary text-white", tag: "text-primary" },
  { card: "bg-accent text-ink border-ink/10", body: "text-ink/70", badge: "bg-ink text-accent", tag: "text-ink/60" },
  { card: "bg-[linear-gradient(150deg,#003CD1_0%,#0030A8_60%,#0B1640_100%)] text-white border-primary", body: "text-white/75", badge: "bg-accent text-ink", tag: "text-accent" },
];

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

// Scroll held at the start/end of the pin before/after the cards move.
const DWELL = 0.07;
/** Scroll progress → deck position. Each flip happens in the middle half of its
 * stretch of scroll (smoothstep), so a card rests, fully readable, either side of it. */
const toPosition = (p: number, steps: number) => {
  const raw = Math.min(1, Math.max(0, (p - DWELL) / (1 - 2 * DWELL))) * steps;
  const i = Math.min(Math.floor(raw), steps - 1);
  const t = Math.min(1, Math.max(0, (raw - i - 0.25) / 0.5));
  return i + t * t * (3 - 2 * t);
};

/**
 * "Why Successbrew?" — a pinned flashcard deck. The section holds still while
 * scrolling flicks the top card away and the next one rises from the deck.
 * Scrolling stays native (it's a tall section with a sticky stage), so trackpads,
 * keyboards and Lenis all behave; the dots jump straight to a card.
 * Reduced-motion visitors get the four reasons as a plain list.
 */
export function WhySuccessbrew({ points }: { points: { title: string; body: string }[] }) {
  const reduced = useReducedMotion();
  if (reduced) return <WhyList points={points} />;
  return <WhyDeck points={points} />;
}

function WhyDeck({ points }: { points: { title: string; body: string }[] }) {
  const trackRef = useRef<HTMLElement>(null);
  const desktop = useIsDesktop();
  const n = points.length;
  const steps = Math.max(1, n - 1);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  const position = useTransform(smooth, (p) => toPosition(p, steps));
  const bar = useTransform(position, [0, steps], [0, 1]);
  const drift = useTransform(position, [0, steps], ["4%", "-10%"]);

  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  useMotionValueEvent(position, "change", (v) => {
    setCurrent(Math.min(n - 1, Math.round(v)));
    setStarted(v > 0.08);
  });

  function jumpTo(k: number) {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const target = top + (DWELL + (k / steps) * (1 - 2 * DWELL)) * travel + 2;
    const lenis = getSmoothScroll();
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <section ref={trackRef} id="why" className="relative bg-cream" style={{ height: `${100 + steps * 75 + 25}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* Oversized backdrop word, drifting slightly with the deck. */}
        <motion.span
          aria-hidden="true"
          style={{ x: drift }}
          className="pointer-events-none absolute -bottom-6 left-0 select-none whitespace-nowrap text-[22vw] font-semibold leading-none tracking-tighter text-ink/[0.035]"
        >
          Successbrew
        </motion.span>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-6 pt-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-10 lg:pt-0">
          {/* ── Left: heading, counter, progress ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">The difference</p>
            <h2 className="mt-3 text-balance text-4xl font-black tracking-tight md:text-6xl">
              <WordReveal text="Why" />{" "}<span className="mark-gradient"><WordReveal text="Successbrew?" /></span>
            </h2>

            <div className="mt-6 flex items-center gap-5 lg:mt-12">
              <div className="relative h-10 w-14 overflow-hidden text-4xl font-semibold leading-none tracking-tight text-primary md:h-14 md:w-20 md:text-6xl" aria-hidden="true">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={current}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 tabular-nums"
                  >
                    {String(current + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex-1">
                <div className="h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-ink/10">
                  <motion.div style={{ scaleX: bar }} className="h-full origin-left rounded-full bg-gradient-to-r from-primary to-accent" />
                </div>
                <div className="mt-3 flex gap-2" role="group" aria-label="Jump to a reason">
                  {points.map((p, k) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => jumpTo(k)}
                      aria-label={`Reason ${k + 1}: ${p.title}`}
                      aria-current={k === current}
                      className="group grid h-6 w-6 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <motion.span
                        animate={{ width: k === current ? 22 : 8, backgroundColor: k === current ? "#003CD1" : "rgba(17,17,17,0.2)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="block h-2 rounded-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <motion.p
              animate={{ opacity: started ? 0 : 1, y: started ? -6 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              aria-hidden={started}
              className="mt-8 hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink/40 lg:flex"
            >
              <span className="relative inline-block h-6 w-4 rounded-full border-2 border-ink/25">
                <motion.span
                  className="absolute left-1/2 top-1 h-1.5 w-1 -translate-x-1/2 rounded-full bg-ink/40"
                  animate={{ y: [0, 6, 0], opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
              Scroll to flip through
            </motion.p>
          </div>

          {/* ── Right: the deck ── */}
          <div className="relative mx-auto h-[340px] w-full max-w-[560px] md:h-[400px] [perspective:1600px]">
            {points.map((w, i) => (
              <Flashcard key={w.title} point={w} index={i} total={n} position={position} sideways={!desktop} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** One card's motion is a pure function of the deck position:
 * waiting cards sit fanned behind, the active one faces you, played ones flick off. */
function Flashcard({ point, index, total, position, sideways }: { point: { title: string; body: string }; index: number; total: number; position: MotionValue<number>; sideways: boolean }) {
  const face = FACES[index % FACES.length];
  const tilt = index % 2 === 0 ? -1 : 1;

  const rel = useTransform(position, (p) => index - p);
  const x = useTransform(rel, (r) => (r >= 0 ? `${r * tilt * 2.5}%` : `${-r * (sideways ? 125 : 18)}%`));
  const y = useTransform(rel, (r) => (r >= 0 ? `${r * 7}%` : `${r * (sideways ? 6 : 135)}%`));
  const rotate = useTransform(rel, (r) => (r >= 0 ? r * tilt * 3 : r * (sideways ? -14 : -9)));
  const rotateX = useTransform(rel, (r) => (r >= 0 || sideways ? 0 : r * -28));
  const scale = useTransform(rel, (r) => (r >= 0 ? 1 - Math.min(r, 3) * 0.055 : 1 + r * 0.06));
  const opacity = useTransform(rel, (r) => (r >= 0 ? (r > 2.6 ? 0 : 1) : (r > -0.6 ? 1 : Math.max(0, (1 + r) / 0.4))));
  const shade = useTransform(rel, (r) => (r > 0 ? Math.min(r, 2) * 0.12 : 0));

  return (
    <motion.article
      style={{ x, y, rotate, rotateX, scale, opacity, zIndex: total - index }}
      className={`absolute inset-0 flex flex-col overflow-hidden rounded-xl border p-7 shadow-[0_30px_70px_-30px_rgba(17,17,17,0.45)] will-change-transform md:p-10 ${face.card}`}
    >
      <div className="flex items-start justify-between gap-6">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold ${face.badge}`}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={`text-xs font-semibold uppercase tracking-[0.1em] ${face.tag}`}>
          Reason {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-auto max-w-md text-2xl font-extrabold tracking-tight md:text-[2rem] md:leading-tight">{point.title}</h3>
      <p className={`mt-3 max-w-md text-base md:text-lg ${face.body}`}>{point.body}</p>
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-8 right-4 select-none text-[9rem] font-semibold leading-none tracking-tighter opacity-[0.06]">
        {String(index + 1).padStart(2, "0")}
      </span>
      {/* Cards waiting in the deck sit slightly in shadow. */}
      <motion.span aria-hidden="true" style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-ink" />
    </motion.article>
  );
}

function WhyList({ points }: { points: { title: string; body: string }[] }) {
  return (
    <section id="why" className="bg-cream py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">The difference</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Why <span className="mark-gradient">Successbrew?</span></h2>
        <ol className="mt-12 grid gap-5 md:grid-cols-2">
          {points.map((w, i) => {
            const face = FACES[i % FACES.length];
            return (
              <li key={w.title} className={`rounded-xl border p-8 ${face.card}`}>
                <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold ${face.badge}`}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 text-2xl font-extrabold tracking-tight">{w.title}</h3>
                <p className={`mt-3 ${face.body}`}>{w.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

