"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * The footer's motion pieces (the Footer itself stays a server component):
 * - FooterMarquee: an endless band of the brand lines, flowing left, pausing on hover;
 * - FooterRise: the columns rise up out of the page as the footer scrolls in;
 * (The big "Successbrew" wordmark lives in FooterBrewMark.tsx.)
 * Reduced motion: everything renders still, in its final state.
 */

const BAND = ["#BrewYourOwnSuccess", "Building 1M entrepreneurs by 2030", "Community", "Content studio", "Podcast", "Learning", "Events"];

export function FooterMarquee() {
  const reduced = useReducedMotion();
  const items = [...BAND, ...BAND];
  return (
    <div className="group relative overflow-hidden border-b border-background/10 py-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex w-max items-center gap-10 whitespace-nowrap ${reduced ? "" : "animate-[footer-marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]"}`}
      >
        {items.map((t, i) => (
          <span key={i} aria-hidden={i >= BAND.length} className="flex items-center gap-10 text-lg font-semibold tracking-tight text-background/70 md:text-2xl">
            <span className={i % BAND.length === 0 ? "text-accent" : ""}>{t}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-primary" fill="currentColor" aria-hidden="true"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" /></svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export function FooterRise({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.55"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  const y = useTransform(p, [0, 1], [70, 0]);
  const opacity = useTransform(p, [0, 1], [0.15, 1]);
  return (
    <motion.div ref={ref} style={reduced ? undefined : { y, opacity }}>
      {children}
    </motion.div>
  );
}
