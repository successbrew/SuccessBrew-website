"use client";

import { motion } from "framer-motion";

const E = [0.22, 1, 0.36, 1] as const;

interface WordRevealProps {
  text: string;
  className?: string;
  mode?: "standalone" | "nested";
  staggerDelay?: number;
}

/**
 * "standalone" self-triggers via whileInView + staggerChildren.
 * "nested" renders plain wrapper spans with a per-word delay, for use inside
 * a parent that already drives "hidden"/"visible" variants.
 */
export function WordReveal({ text, className, mode = "standalone", staggerDelay = 0.07 }: WordRevealProps) {
  const words = text.split(" ");

  if (mode === "nested") {
    return (
      <span className={className}>
        {words.map((word, i) => (
          <span key={i}>
            <span className="inline-block overflow-hidden leading-[1.2]">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "110%", opacity: 0 },
                  visible: { y: "0%", opacity: 1, transition: { duration: 0.65, ease: E, delay: i * staggerDelay } },
                }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerDelay } } }}
    >
      {words.map((word, i) => (
        <span key={i}>
          <span className="inline-block overflow-hidden leading-[1.2]">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                visible: { y: "0%", opacity: 1, transition: { duration: 0.6, ease: E } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.span>
  );
}
