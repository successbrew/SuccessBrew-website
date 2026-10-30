/**
 * Site-wide motion policy — the one switch for "reduce motion" handling.
 *
 * The owner chose (2026-10-30) to show full motion to every visitor, even when
 * their operating system asks for reduced motion (e.g. Windows "Animation
 * effects" off). Set this to `true` to respect the OS setting again: every
 * hook, the Framer Motion config, the direct checks and the CSS overrides
 * (via the `respect-reduced-motion` class on <html>) all follow it.
 */
export const RESPECT_REDUCED_MOTION = false;

const QUERY = "(prefers-reduced-motion: reduce)";

/** One-off check for code outside React render (effects, event handlers). */
export function prefersReducedMotionNow(): boolean {
  return RESPECT_REDUCED_MOTION && typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

/** Value for Framer Motion's <MotionConfig reducedMotion>. */
export const MOTION_CONFIG_REDUCED: "user" | "never" = RESPECT_REDUCED_MOTION ? "user" : "never";

/** Class on <html> that turns the CSS reduced-motion overrides on. */
export const REDUCED_MOTION_HTML_CLASS = RESPECT_REDUCED_MOTION ? "respect-reduced-motion" : "";
