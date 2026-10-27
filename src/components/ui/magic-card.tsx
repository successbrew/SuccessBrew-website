"use client";

/**
 * Magic UI's MagicCard (https://magicui.design/docs/components/magic-card),
 * trimmed to its "gradient" mode: a soft spotlight and a gradient border that
 * follow the cursor. Adapted to the site's framer-motion (the registry version
 * imports `motion/react`) and to a light-only theme (no next-themes).
 * `surfaceClassName` paints the card face, so a card can be blue instead of white.
 */
import React, { useCallback, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

import { cn } from "@/lib/utils";

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  surfaceClassName?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function MagicCard({
  children,
  className,
  surfaceClassName = "bg-background",
  gradientSize = 220,
  gradientColor = "rgba(255, 243, 208, 0.7)",
  gradientFrom = "#003CD1",
  gradientTo = "#C6FF3A",
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    reset();
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) reset();
    };
    window.addEventListener("pointerout", handleGlobalPointerOut);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("pointerout", handleGlobalPointerOut);
      window.removeEventListener("blur", reset);
    };
  }, [reset]);

  const border = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      var(--color-border) 100%
    )
  `;
  const spotlight = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 100%
    )
  `;

  return (
    <div
      className={cn("group relative isolate overflow-hidden rounded-xl", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      <motion.div aria-hidden="true" className="absolute inset-0 rounded-[inherit]" style={{ background: border }} />
      <div aria-hidden="true" className={cn("absolute inset-px z-10 rounded-[inherit]", surfaceClassName)} />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-px z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <div className="relative z-30 h-full">{children}</div>
    </div>
  );
}
