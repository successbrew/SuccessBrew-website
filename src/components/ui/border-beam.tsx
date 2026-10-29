"use client";

import { motion, type MotionStyle } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Magic UI's Border Beam (magicui.design/r/border-beam), adapted to this site:
 * framer-motion instead of motion/react, brand colours by default, and an
 * `active` switch so it only travels while its card is hovered — a continuous
 * loop on idle decoration goes against the site's calm-motion rule.
 */
export function BorderBeam({
  active = true,
  size = 120,
  duration = 4,
  colorFrom = "#C6FF3A",
  colorTo = "#003CD1",
  borderWidth = 2,
  className,
}: {
  active?: boolean;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
      style={{ "--border-beam-width": `${borderWidth}px` } as React.CSSProperties}
    >
      <motion.div
        className={cn("absolute aspect-square bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent", className)}
        style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${size}px)`, "--color-from": colorFrom, "--color-to": colorTo } as MotionStyle}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration }}
      />
    </div>
  );
}
