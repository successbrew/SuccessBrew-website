"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** The `lenis` package itself declares a differently-shaped global `Window.lenis`
 * (its own devtools hook), so we stash the real instance under a distinct key
 * instead of fighting that declaration — anchor-nav components (e.g.
 * EventLandingPageClient's sticky section nav) read it via `getSmoothScroll()`. */
export function getSmoothScroll(): Lenis | undefined {
  return (window as unknown as { __successbrewLenis?: Lenis }).__successbrewLenis;
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    (window as unknown as { __successbrewLenis?: Lenis }).__successbrewLenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as unknown as { __successbrewLenis?: Lenis }).__successbrewLenis = undefined;
    };
  }, []);

  return null;
}
