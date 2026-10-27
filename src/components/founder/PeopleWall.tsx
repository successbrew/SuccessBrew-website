"use client";

/* eslint-disable @next/next/no-img-element */
import { motion, useReducedMotion } from "framer-motion";
import type { FounderClient } from "@/lib/content/founder-clients";


// Deterministic "random" so server and client render the same scatter.
const jitter = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  // Rounded: the browser serialises style values at lower precision than the
  // server, so long decimals here cause a hydration mismatch.
  return Math.round((x - Math.floor(x)) * 1000) / 1000; // 0..1
};
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The people wall: polaroid-style portraits that get dealt onto the table as the
 * section scrolls in — flung in from a loose pile, spinning, then settling at a
 * slight, human tilt. Hover (or focus) straightens a card and lifts it.
 * Each card links to the person's LinkedIn.
 */
export function PeopleWall({ people }: { people: FounderClient[] }) {
  const reduced = useReducedMotion();

  return (
    <motion.ul
      initial="pile"
      whileInView="dealt"
      viewport={{ once: true, margin: "-120px" }}
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-12"
    >
      {people.map((p, i) => {
        const rest = r2((jitter(i, 1) - 0.5) * 6); // final tilt, ±3°
        const pile = {
          x: r2((jitter(i, 2) - 0.5) * 260),
          y: r2(140 + jitter(i, 3) * 120),
          rotate: r2((jitter(i, 4) - 0.5) * 50),
        };
        return (
          <motion.li
            key={p.slug}
            variants={{
              pile: reduced ? { opacity: 0 } : { opacity: 0, ...pile, scale: 0.9 },
              dealt: {
                opacity: 1, x: 0, y: 0, rotate: rest, scale: 1,
                transition: { type: "spring", stiffness: 140, damping: 17, mass: 0.9, delay: reduced ? 0 : i * 0.06 },
              },
            }}
            whileHover={reduced ? undefined : { rotate: 0, y: -10, scale: 1.04, zIndex: 20, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="relative"
          >
            <a
              href={p.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.name} on LinkedIn`}
              className="group block rounded-[4px] bg-[#F7F3EA] p-2.5 pb-4 text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.85)] outline-none transition-shadow duration-300 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              {/* a strip of tape holding the print down */}
              <span aria-hidden="true"
                className="absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 bg-accent/55 mix-blend-multiply"
                style={{ transform: `translateX(-50%) rotate(${r2((jitter(i, 5) - 0.5) * 14)}deg)` }} />
              <Portrait person={p} />
              <span className="mt-3 flex items-start justify-between gap-2 px-1">
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-tight">{p.name}</span>
                  {p.role && <span className="mt-0.5 block text-xs leading-snug text-ink/55">{p.role}</span>}
                </span>
                <svg className="mt-0.5 shrink-0 text-ink/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
              </span>
              <span className="mt-2.5 flex flex-wrap gap-1 px-1">
                {p.work.map((w) => (
                  <span key={w} className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10.5px] font-semibold leading-snug text-ink/65">{w}</span>
                ))}
              </span>
            </a>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

/**
 * Every portrait sits on the same backdrop. Photos get one shared edit — a
 * blue-toned monochrome (luminosity blend) that turns to natural colour on
 * hover — so pictures taken anywhere still read as one set. Background-removed
 * PNGs sit straight on the backdrop.
 */
function Portrait({ person }: { person: FounderClient }) {
  const initials = person.name.replace(/^Dr\.\s*/, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  return (
    <span className="relative block aspect-square overflow-hidden rounded-[2px] bg-[radial-gradient(120%_90%_at_30%_15%,#2A5BFF_0%,#003CD1_38%,#0B1640_100%)]">
      <span aria-hidden="true" className="absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-accent/35 blur-2xl" />
      {person.photo ? (
        <img
          src={person.photo}
          alt={person.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-top mix-blend-luminosity contrast-[1.08] transition-[filter,mix-blend-mode] duration-500 group-hover:mix-blend-normal"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <span className="text-[clamp(2.5rem,7vw,3.75rem)] font-semibold tracking-tight text-white/90 transition-transform duration-500 group-hover:scale-110">
            {initials}
          </span>
        </span>
      )}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(11,22,64,0.45))]" />
    </span>
  );
}

