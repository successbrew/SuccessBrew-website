"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const E = [0.22, 1, 0.36, 1] as const;

/** Headline whose words rise out of a mask one after another. */
export function RiseTitle({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");
  return (
    <h1 className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-top">
          <motion.span className="inline-block"
            initial={reduced ? false : { y: "105%" }} animate={{ y: "0%" }}
            transition={{ duration: 0.8, delay: delay + i * 0.045, ease: E }}>
            {w}{i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/** Cover image that opens from a narrower frame and settles from a slight zoom
 * as it scrolls into view. Transform + clip only. */
export function CoverReveal({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(0% 7% 0% 7% round 24px)", "inset(0% 0% 0% 0% round 24px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  return (
    <motion.div ref={ref} style={reduced ? undefined : { clipPath: clip }} className="overflow-hidden rounded-3xl">
      <motion.img src={src} alt="" style={reduced ? undefined : { scale }} className="aspect-[16/8] w-full object-cover" />
    </motion.div>
  );
}

/** Fades and lifts its children in once, when scrolled into view. */
export function FadeIn({ children, className = "", delay = 0, y = 24 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div className={className}
      initial={reduced ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.65, delay, ease: E }}>
      {children}
    </motion.div>
  );
}
