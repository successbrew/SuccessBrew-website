"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const E = [0.22, 1, 0.36, 1] as const;

/** 1_250_000 → "1.25M", 450_000 → "450K". */
export function formatViews(n: number): string {
  if (n >= 1_000_000_000) return `${+(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** A "nice" axis ceiling and step (1/2/2.5/5 × 10ⁿ) giving about 4 gridlines. */
function niceScale(max: number) {
  const rough = max / 4;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rough) ?? 10 * mag;
  return { step, top: Math.ceil(max / step) * step };
}

/**
 * Cumulative views over time as an area chart, drawn in brand blue with the
 * latest point highlighted in lime. Hand-rolled SVG (no chart library):
 * gridlines + y-axis labels, period labels, hover/keyboard-focus tooltips on
 * every point, a draw-in on first view, and a screen-reader data table.
 */
export function ViewsGrowthChart({ data, inView }: { data: { label: string; views: number }[]; inView: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const { step, top } = niceScale(Math.max(...data.map((d) => d.views)));

  // Chart space is 0–100 on both axes; points are inset so edge labels fit.
  const X0 = 2;
  const X1 = 98;
  const pts = data.map((d, i) => ({
    ...d,
    x: X0 + (i / (data.length - 1)) * (X1 - X0),
    y: 100 - (d.views / top) * 100,
  }));
  const line = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, "");
  const area = `${line} L ${pts[pts.length - 1].x} 100 L ${pts[0].x} 100 Z`;
  const gridValues = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const lastIndex = pts.length - 1;

  return (
    <figure>
      <div className="flex items-center justify-between gap-4">
        <figcaption className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/45">Cumulative views generated</figcaption>
        <span className="text-xs text-ink/45">{data[0].label} – {data[lastIndex].label}</span>
      </div>

      <div className="mt-5 flex gap-3">
        {/* Y-axis labels */}
        <div className="relative w-9 shrink-0 text-right text-[11px] text-ink/40" aria-hidden="true">
          {gridValues.map((v) => (
            <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - (v / top) * 100}%` }}>
              {v === 0 ? "0" : formatViews(v)}
            </span>
          ))}
        </div>

        <div className="relative h-44 flex-1 md:h-52">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="views-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#003CD1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#003CD1" stopOpacity="0" />
              </linearGradient>
              {/* Lime wash that builds towards the latest year */}
              <linearGradient id="views-area-lime" x1="0" y1="0" x2="1" y2="0">
                <stop offset="45%" stopColor="#C6FF3A" stopOpacity="0" />
                <stop offset="100%" stopColor="#C6FF3A" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            {gridValues.map((v) => (
              <line key={v} x1="0" x2="100" y1={100 - (v / top) * 100} y2={100 - (v / top) * 100}
                stroke="#111111" strokeOpacity={v === 0 ? 0.18 : 0.07} strokeWidth="1" vectorEffect="non-scaling-stroke"
                strokeDasharray={v === 0 ? undefined : "3 4"} />
            ))}
            {active !== null && (
              <line x1={pts[active].x} x2={pts[active].x} y1={pts[active].y} y2="100"
                stroke="#003CD1" strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            )}
            <motion.path d={area} fill="url(#views-area)"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.9 }} />
            <motion.path d={area} fill="url(#views-area-lime)"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.1 }} />
            <motion.path d={line} fill="none" stroke="#003CD1" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"
              initial={reducedMotion ? false : { pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.4, ease: E, delay: 0.2 }} />
          </svg>

          {/* Points: focusable, with a tooltip on hover/focus. */}
          {pts.map((p, i) => {
            const isLast = i === lastIndex;
            const show = active === i || (isLast && active === null);
            const alignRight = p.x > 70;
            return (
              <motion.div key={p.label} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + (i / lastIndex) * 1.2 }}>
                <button type="button"
                  aria-label={`${p.label}: ${formatViews(p.views)} views`}
                  onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2.5 focus-visible:outline-none">
                  <span className={`block rounded-full transition-transform ${isLast
                    ? "h-3.5 w-3.5 bg-accent ring-4 ring-primary"
                    : `h-2.5 w-2.5 bg-white ring-[2.5px] ring-primary ${active === i ? "scale-125" : ""}`}`} />
                </button>
                {show && (
                  <span className={`pointer-events-none absolute bottom-3 whitespace-nowrap rounded-[6px] px-2.5 py-1.5 text-xs shadow-sm
                    ${alignRight ? "right-0" : "left-1/2 -translate-x-1/2"}
                    ${isLast ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink"}`}>
                    <span className="font-semibold">{formatViews(p.views)}</span>
                    <span className={isLast ? "text-white/60" : "text-ink/50"}> · {p.label}</span>
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="relative ml-12 mt-3 h-4 text-[11px] text-ink/45" aria-hidden="true">
        {pts.map((p, i) => (
          <span key={p.label}
            className={`absolute ${i === 0 ? "" : i === lastIndex ? "-translate-x-full" : "-translate-x-1/2"}`}
            style={{ left: `${p.x}%` }}>
            {p.label}
          </span>
        ))}
      </div>

      {/* Same data for screen readers. */}
      <table className="sr-only">
        <caption>Cumulative views generated</caption>
        <thead><tr><th>Period</th><th>Total views</th></tr></thead>
        <tbody>
          {data.map((d) => <tr key={d.label}><td>{d.label}</td><td>{formatViews(d.views)}</td></tr>)}
        </tbody>
      </table>
    </figure>
  );
}
