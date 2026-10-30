"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const E = [0.22, 1, 0.36, 1] as const;

/** Visual identity of each event room (keyed by EventPillar slug). The poster
 * card, the room's own page and every event inside it share this, so a room
 * reads as the same "place" wherever it shows up. */
export interface RoomTheme {
  code: string;
  eyebrow: string;
  /** Poster/hero surface. */
  surface: string;
  /** "light" = white text on a dark surface, "dark" = ink text on a light one. */
  tone: "light" | "dark";
  /** Hero backdrop for the room page (a richer version of `surface`). */
  hero: string;
  /** Overlay used over a blurred cover image on an event page. */
  coverWash: string;
}

export const ROOM_THEMES: Record<string, RoomTheme> = {
  "revenue-room": {
    code: "01/04",
    eyebrow: "Investors",
    surface: "bg-[#003CD1]",
    tone: "light",
    hero: "bg-[linear-gradient(135deg,#003CD1_0%,#002A93_55%,#0B1640_100%)]",
    coverWash: "bg-gradient-to-t from-[#0B1640] via-[#003CD1]/55 to-[#003CD1]/85",
  },
  "d2c-round-table": {
    code: "02/04",
    eyebrow: "D2C / Consumer",
    surface: "bg-[#FFF3D0]",
    tone: "dark",
    hero: "bg-[linear-gradient(160deg,#FFF3D0_0%,#F2ECDD_70%,#EADFC4_100%)]",
    coverWash: "bg-gradient-to-t from-[#111111] via-[#003CD1]/45 to-[#111111]/70",
  },
  "tech-integrate": {
    code: "03/04",
    eyebrow: "Tech Founders",
    surface: "bg-[#111111]",
    tone: "light",
    hero: "bg-[#111111]",
    coverWash: "bg-gradient-to-t from-[#111111] via-[#111111]/75 to-[#111111]/85",
  },
  "wellness-retreats": {
    code: "04/04",
    eyebrow: "Retreats",
    surface: "bg-gradient-to-br from-[#C6FF3A] to-[#FFF3D0]",
    tone: "dark",
    hero: "bg-[linear-gradient(160deg,#C6FF3A_0%,#E4FFA8_40%,#FFF3D0_100%)]",
    coverWash: "bg-gradient-to-t from-[#0B1640] via-[#003CD1]/40 to-[#0B1640]/60",
  },
};

export function roomTheme(slug: string): RoomTheme {
  return ROOM_THEMES[slug] ?? ROOM_THEMES["revenue-room"];
}

// SVG children need fill-box so scale/rotate pivot on the shape itself, not the canvas.
const box = { transformBox: "fill-box" } as const;

/** Each room's signature drawing. Static until `play` (hover, focus or scrolled
 * into view), then it performs once — the Tech room's data packet is the only
 * thing that keeps moving, and only while `loop` is on (i.e. while hovered).
 * Reduced motion shows the finished drawing with no movement. */
export function RoomMotif({ slug, play, loop = false }: { slug: string; play: boolean; loop?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const clipId = useId();
  const on = play || !!reduced;
  const t = (delay = 0, duration = 0.7) => (reduced ? { duration: 0 } : { duration, delay, ease: E });

  if (slug === "revenue-room") {
    const bars = [30, 46, 38, 62, 84];
    const tops = bars.map((h, i) => `${110 + i * 18},${140 - h}`).join(" ");
    return (
      <>
        <div aria-hidden className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#C6FF3A]/25 blur-3xl" />
        <svg aria-hidden viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <line x1="96" y1="140.5" x2="196" y2="140.5" stroke="white" strokeOpacity="0.25" />
          {bars.map((h, i) => (
            <motion.rect key={i} x={104 + i * 18} y={140 - h} width="12" height={h} rx="2"
              fill={i === bars.length - 1 ? "#C6FF3A" : "white"} fillOpacity={i === bars.length - 1 ? 1 : 0.18}
              style={{ ...box, originY: 1 }}
              initial={false} animate={{ scaleY: on ? 1 : 0.35 }} transition={t(i * 0.07)} />
          ))}
          <motion.polyline points={tops} fill="none" stroke="#C6FF3A" strokeWidth="1.5" strokeLinecap="round"
            initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={t(0.35, 0.8)} />
        </svg>
      </>
    );
  }

  if (slug === "d2c-round-table") {
    const seats = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return { cx: 100 + Math.cos(a) * 50, cy: 80 + Math.sin(a) * 50 };
    });
    return (
      <svg aria-hidden viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <circle cx="100" cy="80" r="72" fill="none" stroke="#111111" strokeOpacity="0.08" />
        <circle cx="100" cy="80" r="50" fill="none" stroke="#111111" strokeOpacity="0.12" />
        <motion.circle cx="100" cy="80" r="26" fill="#003CD1" fillOpacity="0.1" style={box}
          initial={false} animate={{ scale: on ? 1 : 0.6 }} transition={t(0, 0.8)} />
        <motion.g style={{ ...box, originX: 0.5, originY: 0.5 }} initial={false} animate={{ rotate: on ? 45 : 0 }} transition={t(0, 1.1)}>
          {seats.map((s, i) => (
            <motion.circle key={i} cx={s.cx} cy={s.cy} r="6" style={box}
              fill={i % 2 ? "#003CD1" : "#C6FF3A"} stroke="#111111" strokeOpacity={i % 2 ? 0 : 0.25}
              initial={false} animate={{ scale: on ? 1 : 0.4 }} transition={t(0.1 + i * 0.05, 0.5)} />
          ))}
        </motion.g>
      </svg>
    );
  }

  if (slug === "tech-integrate") {
    const nodes = [{ x: 22, y: 52 }, { x: 134, y: 52 }, { x: 134, y: 108 }];
    return (
      <>
        <div aria-hidden className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: "linear-gradient(#C6FF3A 1px, transparent 1px), linear-gradient(90deg, #C6FF3A 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div aria-hidden className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-[#C6FF3A]/20 blur-3xl" />
        <svg aria-hidden viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <path d="M26 56 H138 V112" fill="none" stroke="#C6FF3A" strokeOpacity="0.35" strokeDasharray="3 4" />
          {nodes.map((n, i) => (
            <motion.rect key={i} x={n.x} y={n.y} width="8" height="8" rx="1.5" stroke="#C6FF3A" strokeWidth="1.2"
              initial={false} animate={{ fill: on ? "#C6FF3A" : "rgba(198,255,58,0)" }} transition={t(0.25 + i * 0.3, 0.3)} />
          ))}
          {!reduced && (
            <motion.rect width="6" height="6" rx="1" fill="#FFFFFF" x="23" y="53"
              initial={false}
              animate={play ? { x: [23, 135, 135], y: [53, 53, 109], opacity: [0, 1, 0] } : { x: 23, y: 53, opacity: 0 }}
              transition={play ? { duration: 1.6, ease: "easeInOut", times: [0, 0.6, 1], repeat: loop ? Infinity : 0, repeatDelay: 0.4 } : { duration: 0.2 }} />
          )}
        </svg>
      </>
    );
  }

  // wellness-retreats
  return (
    <>
      <div aria-hidden className="absolute -left-6 bottom-16 h-36 w-36 rounded-full bg-[#003CD1]/10 blur-2xl" />
      <svg aria-hidden viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <clipPath id={clipId}><rect x="0" y="0" width="200" height="98" /></clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <motion.circle cx="138" cy="82" r="26" fill="white" fillOpacity="0.75"
            initial={false} animate={{ y: on ? 0 : 34 }} transition={t(0, 1.2)} />
        </g>
        {[0, 1, 2].map((i) => (
          <motion.path key={i} d={`M-20 ${100 + i * 10} q 25 -7 50 0 t 50 0 t 50 0 t 50 0 t 50 0`} fill="none"
            stroke="#003CD1" strokeOpacity={0.3 - i * 0.08} strokeWidth="1.4" strokeLinecap="round"
            initial={false} animate={{ x: on ? 0 : -18 + i * 9 }} transition={t(0.1 + i * 0.08, 1.2)} />
        ))}
      </svg>
    </>
  );
}
