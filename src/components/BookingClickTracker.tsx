"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/** Every "Book a Call" CTA across the site (NavBar, Services page, case
 * studies, testimonials, ...) points at this same external booking link —
 * tracked here with one delegated listener instead of wiring an onClick
 * into each of those markedly different components. */
const BOOK_A_CALL_URL = "https://ntis.in/7oApLV";

export function BookingClickTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      if (!link.href.startsWith(BOOK_A_CALL_URL)) return;

      track("book_a_call_click", { path: window.location.pathname });
    }

    // Capture phase — fires even if a framer-motion wrapper stops propagation.
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
