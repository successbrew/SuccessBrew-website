"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const E = [0.22, 1, 0.36, 1] as const;

/** The hero video leans back in 3D and flattens toward the viewer as you scroll
 * down to it, like a screen being turned to face you. Transform-only, driven
 * by scroll position (not scroll events); static under reduced motion. */
export function HeroVideoFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.55"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const rotateX = useTransform(p, [0, 1], [22, 0]);
  const scale = useTransform(p, [0, 1], [0.86, 1]);
  const y = useTransform(p, [0, 1], [40, 0]);

  return (
    <div ref={ref} className="[perspective:1400px]">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.9, ease: E }}
        style={reduced ? undefined : { rotateX, scale, y, transformOrigin: "50% 100%" }}
        className={className}>
        {children}
      </motion.div>
    </div>
  );
}
