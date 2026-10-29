"use client";

import { useEffect, useRef, useState } from "react";

/** Counts a stat like "8,000+", "200K+" or "$8M+" up from 0 the first time `inView`
 * turns true. Values that don't fit that shape are shown as-is.
 *
 * Re-runs whenever the value itself changes (e.g. an admin edits the stat and
 * the page refreshes in place) — otherwise the old count would stay on screen
 * with the new suffix, like "200M+" for a stat that now says "100M+". */
export function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  const match = value.match(/^(\D*)([\d,]+)([KMkm]?)(\+?)$/);
  const target = match ? parseInt(match[2].replace(/,/g, ""), 10) : 0;
  const isCount = Boolean(match);
  const [count, setCount] = useState(0);
  const animatedTo = useRef<number | null>(null);

  useEffect(() => {
    if (!isCount || !inView || animatedTo.current === target) return;
    animatedTo.current = target;
    const duration = 1400;
    const startTime = Date.now();
    let frame = 0;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      animatedTo.current = null; // let a remount (e.g. React StrictMode) animate again
    };
  }, [inView, target, isCount]);

  if (!match) return <>{value}</>;
  const [, prefix, , suffix, plus] = match;
  // Never show more than the target, even for a frame mid-change.
  const shown = Math.min(count, target);
  const formatted = target >= 1000 ? shown.toLocaleString("en-IN") : shown;
  return <>{prefix}{formatted}{suffix}{plus}</>;
}
