"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";
import { WordReveal } from "@/components/WordReveal";

const E = [0.22, 1, 0.36, 1] as const;
const BOOKING_URL = "https://ntis.in/7oApLV";

/** "Choose the engagement" — both book through the same strategy call. */
const ENGAGEMENTS = [
  {
    kicker: "One launch",
    title: "Launch Campaign",
    audience: "For teams preparing to introduce a product, feature or new market offering.",
    summary: "A defined engagement covering strategy, creator partnerships, content coordination and campaign reporting.",
    covers: ["Strategy", "Creator partnerships", "Content coordination", "Campaign reporting"],
    cta: "Plan a Launch Campaign",
    featured: true,
  },
  {
    kicker: "Monthly",
    title: "Ongoing Creator Distribution",
    audience: "For teams that want consistent product discovery beyond a single launch.",
    summary: "A monthly engagement focused on creator activations, content experiments, distribution and performance reviews.",
    covers: ["Creator activations", "Content experiments", "Distribution", "Performance reviews"],
    cta: "Explore Monthly Partnerships",
    featured: false,
  },
] as const;

type Engagement = (typeof ENGAGEMENTS)[number];

export function EngagementCards() {
  return (
    <section id="engagements" className="relative overflow-hidden bg-sand py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="mb-14 max-w-3xl lg:mb-16">
          <motion.p variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } } }}
            className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">How we engage</motion.p>
          <h2 className="mt-3 text-balance text-4xl font-black tracking-tight md:text-6xl">
            <WordReveal text="Choose the engagement that fits your" />{" "}
            <span className="mark-gradient"><WordReveal text="launch." /></span>
          </h2>
        </motion.div>

        <div className="grid gap-6 [perspective:1400px] md:grid-cols-2">
          {ENGAGEMENTS.map((e, i) => (
            <TiltCard key={e.title} engagement={e} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-sm italic text-ink/55"
        >
          Scope, creator participation, production requirements, paid media and timelines are agreed during planning.
        </motion.p>
      </div>
    </section>
  );
}

/** Rises in on scroll, then tilts gently toward a mouse pointer (springy, max ~5°).
 * Touch and reduced-motion visitors get a flat card. */
function TiltCard({ engagement: e, index }: { engagement: Engagement; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), { stiffness: 220, damping: 22 });

  function onPointerMove(ev: React.PointerEvent<HTMLDivElement>) {
    if (reduced || ev.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((ev.clientX - r.left) / r.width - 0.5);
    py.set((ev.clientY - r.top) / r.height - 0.5);
  }
  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  const dark = e.featured;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotateX: reduced ? 0 : 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: E, delay: index * 0.12 }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="h-full"
    >
      <motion.div style={reduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }} className="h-full">
        <MagicCard
          className={`h-full ${dark ? "shadow-[0_40px_80px_-40px_rgb(0_60_209_/_0.6)]" : "shadow-[0_24px_60px_-40px_rgba(17,17,17,0.35)]"}`}
          surfaceClassName={dark ? "bg-[linear-gradient(150deg,#003CD1_0%,#0030A8_60%,#0B1640_100%)]" : "bg-background"}
          gradientColor={dark ? "rgba(198, 255, 58, 0.16)" : "rgba(255, 243, 208, 0.75)"}
          gradientSize={300}
        >
          <div className={`flex h-full flex-col p-8 md:p-10 ${dark ? "text-white" : "text-ink"}`}>
            <div className="flex items-center justify-between gap-4">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${dark ? "bg-accent text-ink" : "bg-sand text-ink/70"}`}>
                {e.kicker}
              </span>
              <span aria-hidden="true" className={`text-sm font-semibold tabular-nums ${dark ? "text-white/40" : "text-ink/30"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <h3 className="mt-8 text-3xl font-extrabold tracking-tight md:text-4xl">{e.title}</h3>
            <p className={`mt-5 text-lg font-semibold ${dark ? "text-white/90" : "text-ink/80"}`}>{e.audience}</p>
            <p className={`mt-3 ${dark ? "text-white/65" : "text-ink/60"}`}>{e.summary}</p>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.35 + index * 0.12 } } }}
              className={`mt-8 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-6 text-sm ${dark ? "border-white/15 text-white/85" : "border-ink/10 text-ink/75"}`}
            >
              {e.covers.map((c) => (
                <motion.li key={c} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: E } } }}
                  className="flex items-center gap-2.5">
                  <svg className={`shrink-0 ${dark ? "text-accent" : "text-primary"}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <motion.path d="M20 6 9 17l-5-5"
                      variants={{ hidden: { pathLength: reduced ? 1 : 0 }, visible: { pathLength: 1, transition: { duration: 0.4, ease: "easeOut" } } }} />
                  </svg>
                  {c}
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-auto pt-10">
              <motion.a
                href={BOOKING_URL}
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                animate="rest"
                className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-colors ${dark
                  ? "glow-lime bg-accent text-ink"
                  : "bg-ink text-white hover:bg-primary"}`}
              >
                {e.cta}
                <motion.span aria-hidden="true" variants={{ rest: { x: 0 }, hover: { x: 4 } }} transition={{ type: "spring", stiffness: 500, damping: 28 }}>
                  →
                </motion.span>
              </motion.a>
            </div>
          </div>
        </MagicCard>
      </motion.div>
    </motion.div>
  );
}
