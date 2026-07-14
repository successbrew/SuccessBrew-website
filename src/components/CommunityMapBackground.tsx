// Stylised flat world-map background: dot-matrix continents + animated
// flight-path connections. Fully self-contained SVG, no external assets.
// Point placement uses a seeded PRNG so server and client render
// identically (no hydration mismatch from Math.random()).

const W = 1000;
const H = 500;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);

type Ellipse = { cx: number; cy: number; rx: number; ry: number };

// Rough, stylised continent silhouettes built from overlapping ellipses —
// not geographically precise, just enough to read as "world map".
const LANDMASSES: Ellipse[] = [
  // North America
  { cx: 150, cy: 145, rx: 95, ry: 75 },
  { cx: 90, cy: 110, rx: 40, ry: 50 },
  { cx: 172, cy: 205, rx: 35, ry: 30 },
  { cx: 70, cy: 70, rx: 35, ry: 25 }, // Alaska
  { cx: 300, cy: 55, rx: 30, ry: 25 }, // Greenland
  // South America
  { cx: 250, cy: 300, rx: 52, ry: 95 },
  { cx: 232, cy: 250, rx: 42, ry: 35 },
  // Europe
  { cx: 500, cy: 110, rx: 55, ry: 45 },
  // Africa
  { cx: 500, cy: 200, rx: 62, ry: 45 },
  { cx: 490, cy: 300, rx: 45, ry: 60 },
  // Asia
  { cx: 600, cy: 140, rx: 70, ry: 60 },
  { cx: 700, cy: 120, rx: 90, ry: 55 },
  { cx: 800, cy: 140, rx: 60, ry: 55 },
  { cx: 680, cy: 220, rx: 70, ry: 55 },
  { cx: 780, cy: 260, rx: 50, ry: 35 },
  // Australia
  { cx: 830, cy: 370, rx: 55, ry: 35 },
];

function inLand(x: number, y: number) {
  for (const e of LANDMASSES) {
    const dx = (x - e.cx) / e.rx;
    const dy = (y - e.cy) / e.ry;
    if (dx * dx + dy * dy <= 1) return true;
  }
  return false;
}

const DOTS: { x: number; y: number; r: number; o: number }[] = [];
for (let y = 15; y <= H - 15; y += 13) {
  for (let x = 15; x <= W - 15; x += 13) {
    const jx = x + (rand() - 0.5) * 8;
    const jy = y + (rand() - 0.5) * 8;
    if (inLand(jx, jy) && rand() > 0.18) {
      DOTS.push({ x: jx, y: jy, r: 1.1 + rand() * 0.9, o: 0.25 + rand() * 0.35 });
    }
  }
}

const HUBS = {
  ny: { x: 118, y: 150 },
  saopaulo: { x: 258, y: 320 },
  london: { x: 495, y: 100 },
  nairobi: { x: 520, y: 260 },
  dubai: { x: 585, y: 175 },
  mumbai: { x: 630, y: 205 },
  singapore: { x: 742, y: 240 },
  tokyo: { x: 832, y: 138 },
  sydney: { x: 850, y: 378 },
} as const;

const LINKS: [keyof typeof HUBS, keyof typeof HUBS][] = [
  ["ny", "london"],
  ["london", "dubai"],
  ["dubai", "mumbai"],
  ["mumbai", "singapore"],
  ["singapore", "tokyo"],
  ["tokyo", "ny"],
  ["saopaulo", "ny"],
  ["saopaulo", "london"],
  ["nairobi", "dubai"],
  ["nairobi", "london"],
  ["sydney", "singapore"],
  ["sydney", "mumbai"],
];

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const bow = Math.min(dist * 0.25, 60);
  return `M ${a.x} ${a.y} Q ${mx} ${my - bow} ${b.x} ${b.y}`;
}

export function CommunityMapBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        maskImage: "radial-gradient(ellipse 75% 75% at 50% 38%, black 35%, transparent 88%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 38%, black 35%, transparent 88%)",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#111111" opacity={d.o * 0.35} />
        ))}

        {LINKS.map(([a, b], i) => {
          const path = arcPath(HUBS[a], HUBS[b]);
          const dur = 4 + (i % 5) * 1.3;
          const begin = (i * 0.6).toFixed(2);
          return (
            <g key={i}>
              <path d={path} fill="none" stroke="#0037D2" strokeWidth={1} strokeOpacity={0.16} />
              <circle r={2.4} fill="#C1FF3B" opacity={0.9}>
                <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} />
                <animate
                  attributeName="opacity"
                  values="0;0.9;0.9;0"
                  keyTimes="0;0.08;0.85;1"
                  dur={`${dur}s`}
                  begin={`${begin}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {Object.entries(HUBS).map(([key, p], i) => (
          <g key={key}>
            <circle cx={p.x} cy={p.y} r={6} fill="#0037D2" opacity={0.22}>
              <animate
                attributeName="r"
                values="6;13;6"
                dur="3.2s"
                begin={`${(i * 0.35).toFixed(2)}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.22;0.02;0.22"
                dur="3.2s"
                begin={`${(i * 0.35).toFixed(2)}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={p.x} cy={p.y} r={3} fill="#0037D2" opacity={0.55} />
          </g>
        ))}
      </svg>
    </div>
  );
}
