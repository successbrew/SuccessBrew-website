"use client";

import { useSyncExternalStore } from "react";
import { RESPECT_REDUCED_MOTION } from "@/lib/motion-policy";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  // See motion-policy.ts: when the site animates for everyone this is always false.
  return RESPECT_REDUCED_MOTION && window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
