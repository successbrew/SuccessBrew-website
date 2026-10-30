"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotionNow } from "@/lib/motion-policy";

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Domain-warped fbm noise mapped onto the brand palette: ink → navy → Persian
// blue, with lime only on the brightest crests. The pointer bends the flow.
const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_intensity;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time * 0.05;
  vec2 m = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0);
  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 4.2));
  vec2 r = vec2(fbm(p * 1.7 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3 + m * 0.45), fbm(p * 1.7 + 2.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.5 + 2.2 * r);
  // fbm clusters around 0.5 — stretch it so the full palette actually shows.
  float k = smoothstep(0.28, 0.78, f);

  vec3 ink = vec3(0.043);
  vec3 navy = vec3(0.043, 0.086, 0.251);
  vec3 blue = vec3(0.0, 0.235, 0.82);
  vec3 sky = vec3(0.24, 0.42, 1.0);
  vec3 lime = vec3(0.776, 1.0, 0.227);
  vec3 col = mix(ink, navy, smoothstep(0.0, 0.3, k));
  col = mix(col, blue, smoothstep(0.25, 0.65, k));
  col = mix(col, sky, smoothstep(0.62, 0.9, k) * 0.55);
  col = mix(col, lime, smoothstep(0.8, 1.0, k * (0.75 + length(r) * 0.35)) * 0.75 * u_intensity);
  col *= 1.0 - 0.75 * smoothstep(0.45, 1.5, length(p * vec2(0.7, 1.0)));
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Full-bleed WebGL backdrop. Renders only while on screen and the tab is
 * visible; reduced motion gets one still frame; no WebGL leaves the CSS
 * fallback gradient underneath. */
export function BrewShader({ intensity = 1, className = "" }: { intensity?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    // A fresh canvas per mount: the cleanup below releases the GPU context, and a
    // remount (StrictMode, fast refresh) must never inherit that lost context.
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    host.appendChild(canvas);
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) { canvas.remove(); return; }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    gl.uniform1f(gl.getUniformLocation(prog, "u_intensity"), intensity);

    const reduced = prefersReducedMotionNow();
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };

    const draw = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform1f(uTime, reduced ? 12 : (now - start) / 1000 + 12);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      draw(now);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const play = () => {
      if (reduced) { resize(); draw(performance.now()); return; }
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    };
    const ro = new ResizeObserver(() => { resize(); if (reduced) draw(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; play(); });
    io.observe(canvas);
    const onVis = () => play();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    resize();
    play();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [intensity]);

  return (
    <div ref={ref} aria-hidden className={`absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,#003CD1_0%,#0B1640_45%,#0B0B0B_80%)] ${className}`} />
  );
}
