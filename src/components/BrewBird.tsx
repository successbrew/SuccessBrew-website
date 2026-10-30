"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * The Brew Bird — a small brand-coloured bird that lives on the site's menu
 * bar. It perches on the bar's bottom edge (only in gaps between buttons, so it
 * never covers anything clickable), hops along when you start scrolling, takes
 * off if the cursor gets close, swoops across the page every so often, and does
 * a loop if you click it. Flights are transform-only and nothing runs while it
 * sits still.
 */

const W = 34;
const H = 26;
const FEET = 23; // y of the feet inside the 34×26 drawing
const HIDDEN_ON = ["/sbh-1111", "/auth", "/account"];

type Spot = { x: number; y: number };

function headerBottom() {
  return document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
}

/** x positions along the bar where the bird doesn't overlap a link or button.
 * On a narrow bar with no free gap it may sit over the edge of the logo. */
function perchSpots(): number[] {
  const bottom = headerBottom();
  if (!bottom) return [];
  const top = bottom - FEET;
  const collect = (selector: string) => {
    const blocks = [...document.querySelectorAll(selector)]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.bottom > top);
    const spots: number[] = [];
    for (let x = 12; x <= window.innerWidth - W - 12; x += 8) {
      if (!blocks.some((r) => x < r.right + 4 && x + W > r.left - 4)) spots.push(x);
    }
    return spots;
  };
  const clear = collect("header a, header button, header img");
  return clear.length ? clear : collect('header a:not([href="/"]), header button');
}

export function BrewBird() {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const x = useMotionValue(-80);
  const y = useMotionValue(140);
  const rotate = useMotionValue(0);
  const [flying, setFlying] = useState(true);
  const [facing, setFacing] = useState(1);
  const [bubble, setBubble] = useState(false);
  // Follows the bird's live position so "#BrewYourOwnSuccess" stays on screen near either edge.
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  useMotionValueEvent(x, "change", (v) => {
    const next = v > window.innerWidth - 150 ? "right" : v < 110 ? "left" : "center";
    setAlign((a) => (a === next ? a : next));
  });
  const pos = useRef<Spot>({ x: -80, y: 140 });
  const busy = useRef(false);
  const lastFlight = useRef(0);
  const hidden = reduced || HIDDEN_ON.some((p) => pathname?.startsWith(p));

  const pickSpot = useCallback((avoidX?: number): Spot | null => {
    const spots = perchSpots();
    if (!spots.length) return null;
    // Prefer somewhere a fair distance away so a flight reads as a flight.
    const far = avoidX === undefined ? spots : spots.filter((s) => Math.abs(s - avoidX) > 160);
    const list = far.length ? far : spots;
    return { x: list[Math.floor(Math.random() * list.length)], y: headerBottom() - FEET };
  }, []);

  const fly = useCallback(async (to: Spot, opts: { swoop?: boolean; loop?: boolean } = {}) => {
    if (busy.current) return;
    busy.current = true;
    setFlying(true);
    const from = pos.current;
    setFacing(to.x >= from.x ? 1 : -1);
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const duration = Math.min(4.2, Math.max(1.1, dist / 380)) + (opts.swoop ? 1 : 0);
    // The bar is at the top of the screen, so every flight dips down into the
    // page (an arc upward would leave the viewport): a swoop deep, a hop shallow.
    const peak = opts.swoop
      ? Math.max(from.y, to.y) + window.innerHeight * (0.28 + Math.random() * 0.2)
      : Math.max(from.y, to.y) + 45 + Math.random() * 55;
    const midX = (from.x + to.x) / 2 + (Math.random() - 0.5) * 120;
    await Promise.all([
      animate(x, [from.x, midX, to.x], { duration, ease: "easeInOut" }),
      animate(y, [from.y, peak, to.y], { duration, ease: "easeInOut" }),
      opts.loop
        ? animate(rotate, [0, -360], { duration: Math.min(duration, 1.4), ease: "easeInOut" })
        : animate(rotate, [0, -10, 6, 0], { duration, ease: "easeInOut" }),
    ]);
    rotate.set(0);
    pos.current = to;
    lastFlight.current = Date.now();
    busy.current = false;
    setFlying(false);
  }, [x, y, rotate]);

  // Arrive a moment after the page loads, flying in from the left.
  useEffect(() => {
    if (hidden) return;
    const t = window.setTimeout(() => {
      const to = pickSpot();
      if (to) void fly(to);
    }, 2200);
    return () => window.clearTimeout(t);
  }, [hidden, pickSpot, fly]);

  useEffect(() => {
    if (hidden) return;
    const perched = () => !busy.current && pos.current.x > 0;

    // Scrolling disturbs it: hop to a new spot (at most every few seconds).
    const onScroll = () => {
      if (perched() && Date.now() - lastFlight.current > 7000) {
        const to = pickSpot(pos.current.x);
        if (to) void fly(to);
      }
    };
    // A cursor that comes close makes it take off.
    const onMove = (e: PointerEvent) => {
      if (!perched()) return;
      const cx = pos.current.x + W / 2;
      const cy = pos.current.y + H / 2;
      if (Math.hypot(e.clientX - cx, e.clientY - cy) < 64) {
        const to = pickSpot(pos.current.x);
        if (to) void fly(to);
      }
    };
    // Every so often it swoops across the page and lands somewhere else.
    let wander: number;
    const schedule = () => {
      wander = window.setTimeout(() => {
        if (!document.hidden && perched()) {
          const to = pickSpot(pos.current.x);
          if (to) void fly(to, { swoop: true });
        }
        schedule();
      }, 40000 + Math.random() * 30000);
    };
    schedule();
    // Keep it on a valid perch when the window changes size.
    const onResize = () => {
      if (busy.current) return;
      const to = pickSpot();
      if (!to) return;
      x.set(to.x);
      y.set(to.y);
      pos.current = to;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(wander);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [hidden, pickSpot, fly, x, y]);

  if (hidden) return null;

  return (
    <motion.div aria-hidden style={{ x, y }} className="pointer-events-none fixed left-0 top-0 z-[60]">
      {/* Only the bird turns (loops, banking); the bubble stays level. */}
      <motion.button type="button" tabIndex={-1} style={{ rotate }}
        onClick={() => {
          setBubble(true);
          window.setTimeout(() => setBubble(false), 2600);
          const to = pickSpot(pos.current.x);
          if (to) void fly(to, { loop: true });
        }}
        className={`pointer-events-auto block cursor-pointer ${flying ? "bird-flying" : "bird-perched"}`}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ transform: `scaleX(${facing})` }} className="overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.18)]">
          {/* tail */}
          <path d="M3 11.5 L10 12 L9 16.5 Z" fill="#111111" />
          {/* far wing (behind the body) */}
          <path className="bird-wing bird-wing-far" d="M13 12.5 Q17 3 23 11.5 Z" fill="#0B1640" />
          {/* body + belly */}
          <ellipse cx="16.5" cy="14.5" rx="9" ry="5.4" fill="#111111" />
          <ellipse cx="18" cy="16.4" rx="5.8" ry="2.6" fill="#003CD1" />
          {/* head */}
          <g className="bird-head">
            <circle cx="25" cy="10.6" r="4.3" fill="#111111" />
            <circle cx="26.4" cy="9.8" r="0.95" fill="#F2ECDD" />
            <path d="M28.8 10 L33 11.2 L28.8 12.4 Z" fill="#C6FF3A" />
          </g>
          {/* near wing */}
          <path className="bird-wing" d="M12 13 Q17.5 1.5 24.5 12 Z" fill="#003CD1" />
          {/* legs — only while perched */}
          <g className="bird-legs" stroke="#111111" strokeWidth="1.1" strokeLinecap="round">
            <path d="M15 19.5 L14.2 23" />
            <path d="M18.6 19.6 L18.6 23" />
          </g>
        </svg>
      </motion.button>
      {bubble && (
        <span className={`pointer-events-none absolute -top-8 whitespace-nowrap rounded-full bg-[#C6FF3A] px-2.5 py-1 text-[10px] font-bold text-[#111111] shadow ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"}`}>
          #BrewYourOwnSuccess
        </span>
      )}
    </motion.div>
  );
}
