"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TAU = Math.PI * 2;
const GOLD = 1.6180339887;

// Named blue channel 'bl' to avoid conflict with loop var 'b'
const PILLARS = [
  { name: "WhatsApp Groups", stat: "50+ Cities",     lat:  0.35, lon:  0.0,  r: 0,   g: 55,  bl: 210 },
  { name: "Podcast",         stat: "100+ Episodes",  lat:  0.60, lon:  2.0,  r: 65,  g: 145, bl: 0   },
  { name: "Events",          stat: "200+ Events",    lat: -0.30, lon:  1.1,  r: 210, g: 65,  bl: 0   },
  { name: "Learning Hub",    stat: "200+ Resources", lat:  0.20, lon:  3.7,  r: 125, g: 15,  bl: 200 },
  { name: "Expert Network",  stat: "500+ Experts",   lat: -0.50, lon: -1.5,  r: 0,   g: 150, bl: 130 },
  { name: "Retreats",        stat: "Members Only",   lat:  0.45, lon: -2.7,  r: 180, g: 115, bl: 0   },
];

function project(
  lat: number, lon: number,
  rotY: number, rotX: number,
  cx: number, cy: number, R: number
) {
  const cl = Math.cos(lat), sl = Math.sin(lat);
  const cY = Math.cos(lon + rotY), sY = Math.sin(lon + rotY);
  const cX = Math.cos(rotX), sX = Math.sin(rotX);
  const px = cl * cY;
  const py = sl * cX - cl * sY * sX;
  const pz = sl * sX + cl * sY * cX;
  return { sx: cx + R * px, sy: cy - R * py, z: pz };
}

interface MNode { lat: number; lon: number; r: number; g: number; bl: number; pi: number; }
interface Conn {
  aLat: number; aLon: number; bLat: number; bLon: number;
  r: number; g: number; bl: number; thick: boolean;
  pulses: { t: number; spd: number }[];
}

export function CommunityNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = useRef({
    mx: -9999, my: -9999,
    rotY: 0, rotX: -0.1,
    members: [] as MNode[],
    conns: [] as Conn[],
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let raf: number;
    let W = 0, H = 0, cx = 0, cy = 0, R = 0;

    const setup = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.resetTransform(); ctx.scale(DPR, DPR);
      cx = W / 2; cy = H / 2;
      R = Math.min(W, H) * 0.37;

      // Fibonacci sphere lattice for even member distribution
      const NM = 80;
      const members: MNode[] = [];
      for (let i = 0; i < NM; i++) {
        const lat = Math.asin(1 - (2 * (i + 0.5)) / NM);
        const lon = (TAU * i / GOLD) % TAU - Math.PI;
        let nearD = Infinity, pi = 0;
        for (let k = 0; k < PILLARS.length; k++) {
          const d = Math.hypot(PILLARS[k].lat - lat, PILLARS[k].lon - lon);
          if (d < nearD) { nearD = d; pi = k; }
        }
        const p = PILLARS[pi];
        members.push({ lat, lon, r: p.r, g: p.g, bl: p.bl, pi });
      }
      S.current.members = members;

      // Build connections
      const conns: Conn[] = [];
      const usedPP = new Set<string>();

      // Pillar-to-pillar (2 nearest neighbours each)
      for (let i = 0; i < PILLARS.length; i++) {
        const pi = PILLARS[i];
        const sorted = PILLARS
          .map((pj, j) => ({ j, d: j === i ? Infinity : Math.hypot(pj.lat - pi.lat, pj.lon - pi.lon) }))
          .sort((a, b) => a.d - b.d);
        for (let k = 0; k < 2; k++) {
          const j = sorted[k].j;
          const key = Math.min(i, j) + "-" + Math.max(i, j);
          if (usedPP.has(key)) continue;
          usedPP.add(key);
          const pj = PILLARS[j];
          conns.push({
            aLat: pi.lat, aLon: pi.lon, bLat: pj.lat, bLon: pj.lon,
            r: (pi.r + pj.r) >> 1, g: (pi.g + pj.g) >> 1, bl: (pi.bl + pj.bl) >> 1,
            thick: true,
            pulses: [
              { t: Math.random(), spd: 0.003 + Math.random() * 0.002 },
              { t: Math.random() * 0.5, spd: 0.002 + Math.random() * 0.002 },
            ],
          });
        }
      }

      // Member-to-nearest-pillar (every 3rd)
      members.forEach((m, i) => {
        if (i % 3 !== 0) return;
        const p = PILLARS[m.pi];
        conns.push({
          aLat: m.lat, aLon: m.lon, bLat: p.lat, bLon: p.lon,
          r: m.r, g: m.g, bl: m.bl,
          thick: false,
          pulses: [{ t: Math.random(), spd: 0.0015 + Math.random() * 0.002 }],
        });
      });

      S.current.conns = conns;
    };

    setup();
    window.addEventListener("resize", setup);

    const tick = () => {
      const live = S.current;

      // ── Rotation ─────────────────────────────────────────────────────────
      const nearGlobe = Math.hypot(live.mx - cx, live.my - cy) < R * 1.2;
      const boost = nearGlobe ? (Math.abs(live.mx - cx) / R) * 0.012 : 0;
      live.rotY += 0.0025 + boost;
      const tRX = nearGlobe ? (live.my - cy) / R * 0.18 - 0.08 : -0.08;
      live.rotX += (tRX - live.rotX) * 0.04;
      const { rotY, rotX } = live;

      // ── Advance pulses ───────────────────────────────────────────────────
      for (const c of live.conns)
        for (const p of c.pulses) { p.t += p.spd; if (p.t > 1) p.t -= 1; }

      // ── Clear ────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // Atmosphere halo
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.18);
      atmo.addColorStop(0, "rgba(0,55,210,0.06)");
      atmo.addColorStop(1, "rgba(242,236,221,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.18, 0, TAU);
      ctx.fillStyle = atmo; ctx.fill();

      // Globe fill (subtle 3-D sphere shading)
      const gfill = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.22, 0, cx, cy, R);
      gfill.addColorStop(0,   "rgba(255,253,248,0.88)");
      gfill.addColorStop(0.65,"rgba(242,236,221,0.55)");
      gfill.addColorStop(1,   "rgba(222,215,200,0.78)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
      ctx.fillStyle = gfill; ctx.fill();

      // ── Clip everything inside the globe circle ───────────────────────────
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();

      // Graticule
      ctx.strokeStyle = "rgba(0,55,210,0.08)";
      ctx.lineWidth = 0.7;
      for (const latDeg of [-60, -30, 0, 30, 60]) {
        const lat = latDeg * Math.PI / 180;
        ctx.beginPath(); let on = false;
        for (let i = 0; i <= 120; i++) {
          const pt = project(lat, (i / 120) * TAU - Math.PI, rotY, rotX, cx, cy, R);
          if (pt.z >= 0) { if (on) ctx.lineTo(pt.sx, pt.sy); else ctx.moveTo(pt.sx, pt.sy); on = true; }
          else on = false;
        }
        ctx.stroke();
      }
      for (let ld = 0; ld < 360; ld += 30) {
        const lon = ld * Math.PI / 180;
        ctx.beginPath(); let on = false;
        for (let i = 0; i <= 60; i++) {
          const pt = project((i / 60) * Math.PI - Math.PI / 2, lon, rotY, rotX, cx, cy, R);
          if (pt.z >= 0) { if (on) ctx.lineTo(pt.sx, pt.sy); else ctx.moveTo(pt.sx, pt.sy); on = true; }
          else on = false;
        }
        ctx.stroke();
      }

      // ── Connections + pulses ──────────────────────────────────────────────
      for (const c of live.conns) {
        const STEPS = 20;
        ctx.beginPath(); let on = false; let prevZ = 0;
        for (let s = 0; s <= STEPS; s++) {
          const t = s / STEPS;
          const pt = project(
            c.aLat + (c.bLat - c.aLat) * t,
            c.aLon + (c.bLon - c.aLon) * t,
            rotY, rotX, cx, cy, R
          );
          if (pt.z > -0.05) {
            if (!on || prevZ <= -0.05) { ctx.moveTo(pt.sx, pt.sy); on = true; }
            else ctx.lineTo(pt.sx, pt.sy);
          } else on = false;
          prevZ = pt.z;
        }
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.bl},${c.thick ? 0.55 : 0.28})`;
        ctx.lineWidth = c.thick ? 1.5 : 0.65;
        ctx.stroke();

        for (const pulse of c.pulses) {
          const t = pulse.t;
          const pt = project(
            c.aLat + (c.bLat - c.aLat) * t,
            c.aLon + (c.bLon - c.aLon) * t,
            rotY, rotX, cx, cy, R
          );
          if (pt.z > 0) {
            ctx.beginPath();
            ctx.arc(pt.sx, pt.sy, c.thick ? 3 : 1.6, 0, TAU);
            ctx.fillStyle = `rgba(${c.r},${c.g},${c.bl},${Math.min(1, pt.z * 1.2)})`;
            ctx.fill();
          }
        }
      }

      // ── Member dots ───────────────────────────────────────────────────────
      for (const m of live.members) {
        const pt = project(m.lat, m.lon, rotY, rotX, cx, cy, R);
        if (pt.z < 0) continue;
        const sz = 1.2 + pt.z * 1.8;
        ctx.beginPath(); ctx.arc(pt.sx, pt.sy, sz, 0, TAU);
        ctx.fillStyle = `rgba(${m.r},${m.g},${m.bl},${pt.z * 0.78})`;
        ctx.fill();
      }

      // ── Pillar nodes ──────────────────────────────────────────────────────
      for (const p of PILLARS) {
        const pt = project(p.lat, p.lon, rotY, rotX, cx, cy, R);
        const depth = pt.z;
        const alpha = Math.max(0.08, (depth + 1) / 2);

        // Glow
        const glow = ctx.createRadialGradient(pt.sx, pt.sy, 0, pt.sx, pt.sy, 24);
        glow.addColorStop(0, `rgba(${p.r},${p.g},${p.bl},${alpha * 0.5})`);
        glow.addColorStop(1, "rgba(242,236,221,0)");
        ctx.beginPath(); ctx.arc(pt.sx, pt.sy, 24, 0, TAU);
        ctx.fillStyle = glow; ctx.fill();

        // Core
        const cR = Math.max(4.5, 4.5 + depth * 4);
        ctx.beginPath(); ctx.arc(pt.sx, pt.sy, cR, 0, TAU);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.bl},${alpha})`;
        ctx.fill();

        // Labels — only when reasonably front-facing
        if (depth > 0.05) {
          const la = Math.min(1, (depth - 0.05) * 1.6);
          ctx.save(); ctx.globalAlpha = la;
          ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
          ctx.font = `800 ${10 + depth * 4}px system-ui,sans-serif`;
          ctx.fillStyle = `rgb(${p.r},${p.g},${p.bl})`;
          ctx.fillText(p.stat, pt.sx, pt.sy - cR - 12);
          ctx.font = `${8 + depth * 2}px system-ui,sans-serif`;
          ctx.fillStyle = "rgba(17,17,17,0.48)";
          ctx.fillText(p.name, pt.sx, pt.sy - cR - 1);
          ctx.restore();
        }
      }

      ctx.restore(); // end clip

      // Globe rim stroke
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
      ctx.strokeStyle = "rgba(0,55,210,0.13)"; ctx.lineWidth = 1.2; ctx.stroke();

      // ── Cream edge blends ─────────────────────────────────────────────────
      const CR = "242,236,221";
      [
        [0, 0, W, H * 0.2,  ctx.createLinearGradient(0, 0, 0, H * 0.2)],
        [0, H * 0.8, W, H * 0.2, ctx.createLinearGradient(0, H * 0.8, 0, H)],
        [0, 0, W * 0.1, H,  ctx.createLinearGradient(0, 0, W * 0.1, 0)],
        [W * 0.9, 0, W * 0.1, H, ctx.createLinearGradient(W * 0.9, 0, W, 0)],
      ].forEach(([x, y, w, h, grd], idx) => {
        (grd as CanvasGradient).addColorStop(idx % 2 === 0 ? 0 : 1, `rgba(${CR},1)`);
        (grd as CanvasGradient).addColorStop(idx % 2 === 0 ? 1 : 0, `rgba(${CR},0)`);
        ctx.fillStyle = grd as CanvasGradient;
        ctx.fillRect(x as number, y as number, w as number, h as number);
      });

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", setup); };
  }, []);

  return (
    <div
      className="relative mt-12 overflow-hidden -mx-6 lg:-mx-10"
      style={{ height: "clamp(380px, 52vw, 640px)" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        onMouseMove={(e) => {
          const rc = e.currentTarget.getBoundingClientRect();
          S.current.mx = e.clientX - rc.left;
          S.current.my = e.clientY - rc.top;
        }}
        onMouseLeave={() => { S.current.mx = -9999; S.current.my = -9999; }}
      />

      {/* Fade-out hint */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-end justify-center pb-12"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 4, duration: 1.4 }}
      >
        <div className="rounded-2xl border border-ink/8 bg-[#F2ECDD]/85 px-6 py-3 text-center shadow-[0_8px_32px_rgba(17,17,17,0.07)] backdrop-blur-lg">
          <p className="text-sm font-semibold text-ink/55">
            Hover to speed up · Watch the ecosystem breathe
          </p>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="pointer-events-none absolute bottom-5 left-0 right-0 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        {PILLARS.map((p) => (
          <span
            key={p.name}
            className="flex items-center gap-1.5 text-[10px] font-semibold"
            style={{ color: `rgb(${p.r},${p.g},${p.bl})` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${p.r},${p.g},${p.bl})` }} />
            {p.name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}