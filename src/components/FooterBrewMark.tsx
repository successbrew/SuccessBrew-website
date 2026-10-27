"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

/**
 * The footer's "Successbrew" wordmark as a cup that's always brewing.
 *
 * - Idle: blue + lime liquid fills the letter shapes, two waves rolling in
 *   opposite directions, bubbles rising. Pours in when it first scrolls into view.
 * - Hover: the level rises toward the brim, the waves quicken, and the liquid
 *   tips toward the pointer like a tilted cup; a light sweep crosses the letters.
 * - Press / tap / Enter ("brew it"): it fills to overflowing, beans and droplets
 *   burst out where you pressed, "#BrewYourOwnSuccess" pops up, then it settles.
 *
 * Performance (per the motion-performance rules): only transforms and opacity
 * move; the wave loop and bubbles pause whenever the wordmark is off screen.
 * Reduced motion: a still, half-full cup; pressing still shows the tag.
 */

const W = 1000; // viewBox width; the word is fitted to it with textLength
const H = 178;
const BASELINE = 165;
const PERIOD = 250; // wave length — waves loop seamlessly by shifting one period

// Liquid surface height (y of the wave crest line, smaller = fuller).
const LEVEL = { empty: H + 30, idle: 112, hover: 70, brim: 16 };

/** A sine-ish surface at y = 0 filled down past the bottom. It spans
 * x = -PERIOD … W + PERIOD, so shifting it by up to one period never shows an edge. */
function wavePath(amp: number) {
  let d = `M ${-PERIOD} 0`;
  for (let x = -PERIOD; x < W + PERIOD; x += PERIOD) {
    d += ` q ${PERIOD / 4} ${-amp} ${PERIOD / 2} 0 t ${PERIOD / 2} 0`;
  }
  return `${d} V ${H + 260} H ${-PERIOD} Z`;
}
const BACK_WAVE = wavePath(12);
const FRONT_WAVE = wavePath(9);

const BUBBLE_START = 130; // below the surface, inside the liquid group
const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  x: 40 + ((i * 677) % 920),
  r: 2.5 + (i % 4) * 1.4,
  dur: 3.2 + ((i * 37) % 23) / 10,
  delay: -((i * 53) % 40) / 10,
}));

type Burst = { id: number; x: number; y: number; pieces: { dx: number; dy: number; rot: number; bean: boolean; size: number; tone: string }[] };
const TONES = ["#C6FF3A", "#3D6BFF", "#FFF3D0", "#C6FF3A", "#003CD1"];

export function FooterBrewMark() {
  const reduced = useReducedMotion();
  const clipId = useId().replace(/:/g, "");
  const box = useRef<HTMLButtonElement>(null);
  const live = useInView(box, { margin: "100px" }); // pause everything off screen
  const seen = useInView(box, { once: true, margin: "-80px" });

  const [hover, setHover] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [tagAt, setTagAt] = useState<{ x: number; key: number } | null>(null);

  // Liquid level + tilt, both springy.
  const level = useMotionValue(LEVEL.empty);
  const levelS = useSpring(level, { stiffness: 70, damping: 12, mass: 0.9 });
  const tiltTarget = useMotionValue(0);
  const tilt = useSpring(tiltTarget, { stiffness: 120, damping: 14 });
  const sweep = useMotionValue(-400); // in viewBox units

  // Wave positions, advanced by hand so speed can change smoothly on hover.
  const backX = useMotionValue(0);
  const frontX = useMotionValue(-PERIOD / 2);
  const speed = useRef(1);
  useAnimationFrame((_, dt) => {
    if (reduced || !live) return;
    const target = hover ? 2.6 : 1;
    speed.current += (target - speed.current) * Math.min(1, dt / 300);
    const step = (dt / 1000) * 60 * speed.current;
    // back wave drifts left, front wave right; each wraps after one period (both stay in [-PERIOD, 0])
    let b = backX.get() - step * 0.9;
    if (b <= -PERIOD) b += PERIOD;
    let f = frontX.get() + step * 1.4;
    if (f >= 0) f -= PERIOD;
    backX.set(b);
    frontX.set(f);
  });

  // Pours in the first time it's seen; afterwards follows hover.
  useEffect(() => {
    if (!seen) return;
    level.set(hover ? LEVEL.hover : LEVEL.idle);
    if (!hover) tiltTarget.set(0);
  }, [hover, seen, level, tiltTarget]);

  const brew = useCallback(
    (clientX?: number, clientY?: number) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      const x = clientX !== undefined ? ((clientX - r.left) / r.width) * 100 : 50;
      const y = clientY !== undefined ? ((clientY - r.top) / r.height) * 100 : 40;
      const key = Date.now();
      setTagAt({ x: Math.min(82, Math.max(18, x)), key });
      if (reduced) return;

      // Overfill, then drain back to where it was.
      level.set(LEVEL.brim);
      window.setTimeout(() => level.set(hover ? LEVEL.hover : LEVEL.idle), 900);

      const pieces = Array.from({ length: 22 }, (_, i) => {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
        const v = 90 + Math.random() * 170;
        return {
          dx: Math.cos(a) * v,
          dy: Math.sin(a) * v,
          rot: (Math.random() - 0.5) * 540,
          bean: i % 3 === 0,
          size: 6 + Math.random() * 8,
          tone: TONES[i % TONES.length],
        };
      });
      setBursts((b) => [...b.slice(-3), { id: key, x, y, pieces }]);
      window.setTimeout(() => setBursts((b) => b.filter((p) => p.id !== key)), 1600);
    },
    [hover, level, reduced]
  );

  return (
    <div className="relative px-4 pt-6 lg:px-8">
      <button
        ref={box}
        type="button"
        aria-label="Successbrew — press to brew"
        onPointerEnter={(e) => { if (e.pointerType === "mouse") { setHover(true); animate(sweep, [-400, W + 200], { duration: 1.1, ease: "easeInOut" }); } }}
        onPointerLeave={() => setHover(false)}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          tiltTarget.set((((e.clientX - r.left) / r.width) - 0.5) * 7);
        }}
        onClick={(e) => brew(e.detail === 0 ? undefined : e.clientX, e.detail === 0 ? undefined : e.clientY)}
        className={`group relative block w-full cursor-pointer select-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent ${live ? "" : "brew-paused"}`}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
          <defs>
            <clipPath id={`${clipId}-word`}>
              <text x="2" y={BASELINE} textLength={W - 4} lengthAdjust="spacingAndGlyphs" fontSize="196" fontWeight="600" className="font-sans">
                Successbrew
              </text>
            </clipPath>
            <linearGradient id={`${clipId}-back`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3D6BFF" />
              <stop offset="1" stopColor="#0B1640" />
            </linearGradient>
            <linearGradient id={`${clipId}-front`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#C6FF3A" />
              <stop offset="0.55" stopColor="#7FB800" />
              <stop offset="1" stopColor="#1F55E8" />
            </linearGradient>
            <linearGradient id={`${clipId}-shine`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* the empty cup: outlined letters */}
          <text x="2" y={BASELINE} textLength={W - 4} lengthAdjust="spacingAndGlyphs" fontSize="196" fontWeight="600"
            className="font-sans" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4">
            Successbrew
          </text>

          {/* the brew, clipped to the letters */}
          <g clipPath={`url(#${clipId}-word)`}>
            <motion.g style={{ rotate: reduced ? 0 : tilt, originX: "50%", originY: "60%" }}>
              <motion.g style={{ y: reduced ? LEVEL.idle : levelS }}>
                {/* the blue layer rides a little higher, so it shows as a band above the lime */}
                <g transform="translate(0 -16)">
                  <motion.path d={BACK_WAVE} fill={`url(#${clipId}-back)`} style={{ x: backX }} />
                </g>
                <motion.path d={FRONT_WAVE} fill={`url(#${clipId}-front)`} opacity="0.92" style={{ x: frontX }} />
                {BUBBLES.map((b, i) => (
                  <circle key={i} className="brew-bubble" cx={b.x} cy={BUBBLE_START} r={b.r} fill="rgba(255,255,255,0.55)"
                    style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
                ))}
              </motion.g>
            </motion.g>
            {/* hover light sweep */}
            {!reduced && (
              <g transform="skewX(-18)">
                <motion.rect y="0" width="240" height={H + 60} fill={`url(#${clipId}-shine)`} style={{ x: sweep }} />
              </g>
            )}
          </g>
        </svg>

        <span className="pointer-events-none absolute bottom-1 right-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-background/0 transition-colors duration-300 group-hover:text-background/45 group-focus-visible:text-background/45">
          Click to brew
        </span>

        {/* bursts: beans + droplets flung out where you pressed, falling under gravity */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
          {bursts.map((b) =>
            b.pieces.map((p, i) => (
              <motion.span
                key={`${b.id}-${i}`}
                className="absolute block"
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: p.size * (p.bean ? 1 : 0.7), height: p.size * (p.bean ? 1.35 : 0.7) }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
                animate={{ x: p.dx * 1.6, y: [0, p.dy, p.dy + 260], opacity: [1, 1, 0], rotate: p.rot, scale: 1 }}
                transition={{ duration: 1.4, ease: "easeOut", y: { duration: 1.4, times: [0, 0.35, 1], ease: ["easeOut", "easeIn"] } }}
              >
                {p.bean ? (
                  <svg viewBox="0 0 10 14" className="h-full w-full"><ellipse cx="5" cy="7" rx="4.6" ry="6.6" fill="#6B3E1F" /><path d="M5 1.2 C 3 5, 7 9, 5 12.8" stroke="#2A170B" strokeWidth="1.1" fill="none" /></svg>
                ) : (
                  <span className="block h-full w-full rounded-full" style={{ background: p.tone }} />
                )}
              </motion.span>
            ))
          )}
        </span>

        <AnimatePresence>
          {tagAt && (
            <motion.span
              key={tagAt.key}
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-[0_12px_30px_-10px_rgba(198,255,58,0.7)]"
              style={{ left: `${tagAt.x}%` }}
              initial={{ opacity: 0, y: 30, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, y: -18, scale: 1, rotate: -3 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              onAnimationComplete={() => window.setTimeout(() => setTagAt((t) => (t?.key === tagAt.key ? null : t)), 1300)}
            >
              #BrewYourOwnSuccess
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
