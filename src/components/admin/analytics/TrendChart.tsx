"use client";

import { useId } from "react";

const WIDTH = 640;
const HEIGHT = 200;
const PAD_X = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

/** Single-series line + area trend, following the skill's mark spec: 2px line,
 * ~10% opacity area wash, one end-label (not a value on every point), hairline baseline. */
export function TrendChart({ points }: { points: { label: string; value: number }[] }) {
  const gradientId = useId();

  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }

  const max = Math.max(...points.map((p) => p.value), 1);
  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: PAD_X + stepX * i,
    y: PAD_TOP + plotHeight - (p.value / max) * plotHeight,
    ...p,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(PAD_TOP + plotHeight).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(PAD_TOP + plotHeight).toFixed(1)} Z`;
  const last = coords[coords.length - 1];

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Applications per month">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0037D2" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0037D2" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line x1={PAD_X} y1={PAD_TOP + plotHeight} x2={WIDTH - PAD_X} y2={PAD_TOP + plotHeight} stroke="currentColor" className="text-border" strokeWidth={1} />

      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke="#0037D2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* end marker + value label */}
      <circle cx={last.x} cy={last.y} r={4} fill="#0037D2" stroke="var(--card)" strokeWidth={2} />
      <text x={Math.min(last.x, WIDTH - 24)} y={last.y - 10} textAnchor="end" className="fill-foreground text-[11px] font-medium">
        {last.value}
      </text>

      {/* x-axis labels */}
      {coords.map((c) => (
        <text key={c.label} x={c.x} y={HEIGHT - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
          {c.label}
        </text>
      ))}
    </svg>
  );
}
