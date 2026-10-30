"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    { label: "Days", value: Math.floor(s / 86400) },
    { label: "Hrs", value: Math.floor((s % 86400) / 3600) },
    { label: "Min", value: Math.floor((s % 3600) / 60) },
    { label: "Sec", value: s % 60 },
  ];
}

/** Live ticking countdown to `target`. Renders nothing until mounted (the clock
 * is client-only, so SSR can't agree with it) and nothing once the time has
 * passed. Each unit rolls its new value in from below; reduced motion swaps
 * values in place. */
export function Countdown({ target, tone = "dark", className = "", lead }: { target: string; tone?: "light" | "dark"; className?: string; lead?: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [now, setNow] = useState<number | null>(null);
  const end = new Date(target).getTime();

  useEffect(() => {
    // Initial read happens after mount on purpose — see the doc comment.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null || end <= now) return null;

  const cell = tone === "light" ? "bg-white/10 text-white" : "bg-[#111111] text-white";
  const label = tone === "light" ? "text-white/55" : "text-[#111111]/45";

  return (
    <div className={`flex items-start gap-2 ${className}`} role="timer" aria-label="Time until the event starts">
      {lead}
      {parts(end - now).map((p) => {
        const text = String(p.value).padStart(2, "0");
        return (
          <div key={p.label} className="flex flex-col items-center">
            <span className={`relative grid h-12 w-12 place-items-center overflow-hidden rounded-xl text-lg font-black tabular-nums sm:h-14 sm:w-14 sm:text-xl ${cell}`}>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span key={text}
                  initial={reduced ? false : { y: "70%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={reduced ? undefined : { y: "-70%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                  {text}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${label}`}>{p.label}</span>
          </div>
        );
      })}
    </div>
  );
}
