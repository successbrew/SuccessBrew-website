"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

const E = [0.22, 1, 0.36, 1] as const;
const BOOKING_URL = "https://ntis.in/7oApLV";
const HEADLINE = ["Let's", "plan", "your", "next", "product", "launch."];
const LIME_FROM = 4; // "product launch." is set in lime
const TRAIL = "M -40 520 C 260 500, 420 380, 620 300 S 1020 90, 1480 40";

/**
 * Closing CTA with its own motion language (deliberately unlike the deck above):
 * - the blue panel opens out from an inset card to full-bleed as it scrolls in;
 * - a launch trail draws across it, carrying a lime "payload" along the curve;
 * - the headline sharpens into focus word by word (blur → crisp);
 * - a soft lime glow follows the mouse.
 * Reduced motion: the panel is simply full-bleed and still.
 */
export function LaunchCTA() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.15"] });
  const open = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  const inset = useTransform(open, [0, 1], [7, 0]);
  const radius = useTransform(open, [0, 1], [36, 0]);
  const clipPath = useMotionTemplate`inset(${inset}% ${inset}% 0% ${inset}% round ${radius}px)`;

  const { scrollYProgress: through } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const trail = useSpring(through, { stiffness: 90, damping: 24 });
  // The lime payload rides the curve: sample the path at the trail's progress.
  const trailRef = useRef<SVGPathElement>(null);
  const dotX = useMotionValue(-40);
  const dotY = useMotionValue(520);
  const dotOpacity = useTransform(trail, [0, 0.04, 0.98, 1], [0, 1, 1, 0.6]);
  useMotionValueEvent(trail, "change", (v) => {
    const path = trailRef.current;
    if (!path) return;
    const pt = path.getPointAtLength(Math.min(1, Math.max(0, v)) * path.getTotalLength());
    dotX.set(pt.x);
    dotY.set(pt.y);
  });

  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const gx = useSpring(mx, { stiffness: 160, damping: 24 });
  const gy = useSpring(my, { stiffness: 160, damping: 24 });
  const glow = useMotionTemplate`radial-gradient(420px circle at ${gx}px ${gy}px, rgba(198,255,58,0.16), transparent 70%)`;

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  return (
    <section ref={ref} id="cta" className="relative bg-cream">
      <motion.div
        style={reduced ? undefined : { clipPath }}
        onPointerMove={onPointerMove}
        className="relative overflow-hidden bg-[linear-gradient(135deg,#003CD1_0%,#002A93_55%,#0B1640_100%)] text-primary-foreground"
      >
        {!reduced && <motion.div aria-hidden="true" style={{ background: glow }} className="pointer-events-none absolute inset-0" />}

        {/* Launch trail: a curve that draws itself as you scroll, carrying a lime payload. */}
        {!reduced && (
          <svg aria-hidden="true" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 hidden h-full w-full md:block">
            <defs>
              <linearGradient id="launch-trail" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#C6FF3A" stopOpacity="0" />
                <stop offset="0.6" stopColor="#C6FF3A" stopOpacity="0.35" />
                <stop offset="1" stopColor="#C6FF3A" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d={TRAIL} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 10" />
            <motion.path ref={trailRef} d={TRAIL} fill="none" stroke="url(#launch-trail)" strokeWidth="2.5" strokeLinecap="round" style={{ pathLength: trail }} />
            <motion.circle cx={dotX} cy={dotY} r="7" fill="#C6FF3A" style={{ opacity: dotOpacity, filter: "drop-shadow(0 0 10px rgba(198,255,58,0.8))" }} />
          </svg>
        )}

        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center lg:px-10 lg:py-40">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.1em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: E }}
            className="text-xs font-semibold uppercase text-primary-foreground/70"
          >
            Let&apos;s build
          </motion.p>

          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
            className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-black leading-[0.95] tracking-tight md:text-8xl"
          >
            {HEADLINE.map((w, i) => (
              <motion.span
                key={w}
                variants={{
                  hidden: { opacity: 0, filter: reduced ? "blur(0px)" : "blur(14px)", y: reduced ? 0 : 18, scale: reduced ? 1 : 1.06 },
                  visible: { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, transition: { duration: 0.8, ease: E } },
                }}
                className={`inline-block ${i >= LIME_FROM ? "text-accent" : ""}`}
              >
                {w}
                {i < HEADLINE.length - 1 && " "}
              </motion.span>
            ))}
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.55 } } }}
          >
            <motion.p variants={rise} className="mx-auto mt-8 max-w-xl text-lg text-primary-foreground/70">
              Tell us what you&apos;re building, who needs it and what a successful launch would look like.
            </motion.p>
            <motion.p variants={rise} className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/70">
              We&apos;ll discuss the audience, creator strategy, campaign scope and metrics that make sense for your product.
            </motion.p>
            <motion.div variants={rise} className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <ArrowButton href={BOOKING_URL} className="glow-lime bg-accent text-ink">
                Book a Product Launch Strategy Call
              </ArrowButton>
              <ArrowButton href="#work" className="border border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10">
                See the work
              </ArrowButton>
            </motion.div>
            <motion.p variants={rise} className="mx-auto mt-8 max-w-xl text-sm text-primary-foreground/60">
              No generic marketing pitch. A focused conversation about your product and its route to market.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

const rise = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } } };

/** Pill button whose arrow launches off and re-enters on hover. */
function ArrowButton({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-semibold transition-colors ${className}`}
    >
      {children}
      <span aria-hidden="true" className="relative inline-block h-4 w-4 overflow-hidden">
        <motion.span className="absolute inset-0 grid place-items-center" variants={{ rest: { x: 0, y: 0 }, hover: { x: 18, y: -18 } }} transition={{ duration: 0.3, ease: E }}>↗</motion.span>
        <motion.span className="absolute inset-0 grid place-items-center" variants={{ rest: { x: -18, y: 18 }, hover: { x: 0, y: 0 } }} transition={{ duration: 0.3, ease: E, delay: 0.05 }}>↗</motion.span>
      </span>
    </motion.a>
  );
}
