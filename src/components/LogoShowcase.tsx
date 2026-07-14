/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useSpring } from "framer-motion";

const E = [0.22, 1, 0.36, 1] as const;

export interface BrandPartner {
  _id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
}

/**
 * Magnetic logo card: on hover, the card is gently pulled toward the cursor
 * (same technique as the hero's MagneticButton), plus scales up, lifts, gains
 * a soft lime glow, and un-desaturates from grayscale to full color.
 */
function LogoCard({ partner, alwaysColor }: { partner: BrandPartner; alwaysColor?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20 });
  const sy = useSpring(y, { stiffness: 260, damping: 20 });
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left - r.width / 2) * 0.18);
    y.set((e.clientY - r.top - r.height / 2) * 0.18);
  }
  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const content = (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.08, transition: { duration: 0.3, ease: E } }}
      className="group relative flex h-20 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-ink/5 bg-background/80 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_16px_40px_-12px_rgba(45,25,140,0.25)] sm:h-24 sm:w-48"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "0 0 0 1.5px var(--color-accent), 0 0 24px 2px color-mix(in oklch, var(--color-accent) 55%, transparent)" }}
      />
      <img
        src={partner.logoUrl}
        alt={partner.name}
        draggable={false}
        className={`h-full w-full object-contain p-5 transition-all duration-300 ease-out sm:p-6 ${alwaysColor ? "" : "grayscale group-hover:grayscale-0"}`}
      />
    </motion.div>
  );

  return partner.websiteUrl ? (
    <a href={partner.websiteUrl} target="_blank" rel="noreferrer noopener" aria-label={partner.name}>
      {content}
    </a>
  ) : (
    content
  );
}

/** One continuously-scrolling row; pauses on hover so a magnetic hover has a stable target. */
function LogoRow({
  items,
  pxPerSecond,
  direction,
  alwaysColor,
}: {
  items: BrandPartner[];
  pxPerSecond: number;
  direction: 1 | -1;
  alwaysColor?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [loopWidth, setLoopWidth] = useState(0);
  const isPaused = useRef(false);

  useEffect(() => {
    if (trackRef.current) setLoopWidth(trackRef.current.scrollWidth / 2);
  }, [items]);

  useAnimationFrame((_, delta) => {
    if (!loopWidth || isPaused.current) return;
    let next = x.get() - (direction * pxPerSecond * delta) / 1000;
    if (direction === 1 && next <= -loopWidth) next += loopWidth;
    if (direction === -1 && next >= 0) next -= loopWidth;
    x.set(next);
  });

  // direction -1 rows should start already offset into the loop so they don't
  // all visually start at the same place.
  useEffect(() => {
    if (direction === -1 && loopWidth) x.set(-loopWidth / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopWidth]);

  if (items.length === 0) return null;

  return (
    <div
      className="-my-8 overflow-hidden py-8"
      style={{
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-5">
        {[...items, ...items].map((p, i) => (
          <LogoCard key={`${p._id}-${i}`} partner={p} alwaysColor={alwaysColor} />
        ))}
      </motion.div>
    </div>
  );
}

function distributeRows<T>(items: T[], rowCount: number): T[][] {
  const rows: T[][] = Array.from({ length: rowCount }, () => []);
  items.forEach((item, i) => rows[i % rowCount].push(item));
  return rows.filter((r) => r.length > 0);
}

export function LogoShowcase({
  brandPartners,
  eyebrow = "Trusted By",
  heading = "Brands who trust Successbrew.",
  alwaysColor = false,
  sectionBg = "bg-background",
}: {
  brandPartners: BrandPartner[];
  eyebrow?: string;
  heading?: string;
  alwaysColor?: boolean;
  sectionBg?: string;
}) {
  if (brandPartners.length === 0) return null;

  const rowCount = brandPartners.length <= 4 ? 1 : brandPartners.length <= 10 ? 2 : 3;
  const rows = distributeRows(brandPartners, rowCount);
  const speeds = [26, 34, 20];

  return (
    <section className={`relative overflow-hidden py-24 lg:py-32 ${sectionBg}`}>
      {/* Ambient drifting background blobs — slow, decorative, non-interactive */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-24 top-0 h-[380px] w-[380px] rounded-full bg-accent/15 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: E } }}
          viewport={{ once: true, margin: "-60px" }}
          className="mb-14 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
          <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-5xl">
            {heading}
          </h2>
        </motion.div>

        <div className="space-y-5">
          {rows.map((row, i) => (
            <LogoRow
              key={i}
              items={row}
              pxPerSecond={speeds[i % speeds.length]}
              direction={i % 2 === 0 ? 1 : -1}
              alwaysColor={alwaysColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
