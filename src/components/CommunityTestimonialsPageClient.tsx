/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Shuffle } from "lucide-react";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import type { Testimonial } from "@/components/ServicesPageClient";
import { Footer } from "@/components/Footer";
import { WordReveal } from "@/components/WordReveal";
import { ExpandableQuote } from "@/components/ExpandableQuote";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

// Paper stock for the pinned notes, cycled through the wall.
const PAPERS = [
  { card: "bg-white text-[#111111]", sub: "text-[#111111]/50", tape: "bg-[#C6FF3A]/70" },
  { card: "bg-[#FFF3D0] text-[#111111]", sub: "text-[#111111]/50", tape: "bg-[#003CD1]/25" },
  { card: "bg-[#003CD1] text-white", sub: "text-white/60", tape: "bg-[#C6FF3A]/80" },
  { card: "bg-[#C6FF3A] text-[#111111]", sub: "text-[#111111]/55", tape: "bg-white/60" },
  { card: "bg-[#111111] text-white", sub: "text-white/55", tape: "bg-[#FFF3D0]/50" },
];

/** Deterministic small tilt per position so SSR and client agree. */
function tilt(i: number) {
  return (((i * 37) % 7) - 3) * 0.7;
}

interface Props {
  testimonials: Testimonial[];
  siteSettings: SiteSettings;
}

function NameChip({ t }: { t: Testimonial }) {
  return (
    <span className="mx-2 inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[#111111]/10 bg-white py-1.5 pl-1.5 pr-4">
      {t.avatarUrl ? (
        <img src={t.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
      ) : (
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#003CD1] text-[11px] font-bold text-white">{t.initial}</span>
      )}
      <span className="text-sm font-semibold text-[#111111]">{t.name}</span>
    </span>
  );
}

/** Two rows of member names drifting past in opposite directions. */
function NameRiver({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half).length ? items.slice(half) : items.slice(0, half)];
  return (
    <div aria-hidden className="space-y-3 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} className="overflow-hidden">
          <div className="animate-marquee" style={{ animationDuration: `${Math.max(30, row.length * 6)}s`, animationDirection: r ? "reverse" : "normal" }}>
            {[0, 1].map((g) => (
              <div key={g} className="flex">
                {/* Repeat short lists so one copy is wider than the viewport. */}
                {Array.from({ length: Math.max(1, Math.ceil(8 / row.length)) }).flatMap((_, k) => row.map((t) => <NameChip key={`${g}-${k}-${t._id}`} t={t} />))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Note({ t, i }: { t: Testimonial; i: number }) {
  const reduced = useReducedMotion();
  const paper = PAPERS[i % PAPERS.length];
  const r = tilt(i);
  return (
    <motion.figure layout={!reduced}
      initial={reduced ? false : { opacity: 0, y: 40, rotate: r * 3 }}
      whileInView={{ opacity: 1, y: 0, rotate: r }}
      whileHover={reduced ? undefined : { rotate: 0, y: -6, scale: 1.02, zIndex: 10 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      className={`relative mb-6 break-inside-avoid rounded-2xl p-7 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] ${paper.card}`}>
      <span aria-hidden className={`absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-3deg] rounded-sm ${paper.tape}`} />
      <blockquote className="text-[15px] leading-relaxed">
        <ExpandableQuote quote={t.quote} name={t.name} role={t.role} initial={t.initial} avatarUrl={t.avatarUrl} previewLength={240}
          readMoreClassName="mt-3 block text-xs font-bold underline underline-offset-4 opacity-70 transition hover:opacity-100" />
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {t.avatarUrl ? (
          <img src={t.avatarUrl} alt={t.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${t.avatarStyle === "accent" ? "bg-[#C6FF3A] text-[#111111]" : "bg-[#003CD1] text-white"} ring-2 ring-white/60`}>{t.initial}</span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-black">{t.name}</p>
          <p className={`line-clamp-2 text-xs ${paper.sub}`}>{t.role}</p>
        </div>
      </figcaption>
    </motion.figure>
  );
}

export function CommunityTestimonialsPageClient({ testimonials, siteSettings }: Props) {
  const [order, setOrder] = useState(testimonials);

  function shuffle() {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
  }

  return (
    <>
      <NavBar activePage="Community" ctaText="Apply to Join" ctaHref="/apply?source=community" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-32 pb-14 lg:pt-40 lg:pb-20">
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}>
              <motion.a variants={fadeUp} href="/community"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#111111]/50 hover:text-[#003CD1]">
                ← Community
              </motion.a>
              <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <h1 className="text-balance text-[clamp(3rem,8vw,7rem)] font-black leading-[0.9] tracking-tight">
                  <WordReveal text="The wall of" mode="nested" staggerDelay={0.06} />{" "}
                  <span className="mark-gradient text-[#003CD1]"><WordReveal text="voices." mode="nested" staggerDelay={0.06} /></span>
                </h1>
                <motion.div variants={fadeUp} className="max-w-xs lg:pb-3">
                  <p className="text-6xl font-black tracking-tight text-[#003CD1]">{testimonials.length}</p>
                  <p className="mt-1 text-sm text-[#111111]/60">stories pinned up by founders, freelancers and creators from inside the community.</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-14">
            <NameRiver items={testimonials} />
          </motion.div>
        </section>

        {/* ══ THE WALL ══════════════════════════════════════════════════ */}
        <section className="relative bg-[#EADFC4] py-16 lg:py-24">
          {/* Faint cork-board grain. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#111111_0.6px,transparent_0.6px)] [background-size:14px_14px] [mask-image:linear-gradient(transparent,black_10%,black_90%,transparent)]" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#111111]/55">In their own words · hover a note to straighten it</p>
              {order.length > 1 && (
                <button type="button" onClick={shuffle}
                  className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#003CD1]">
                  <Shuffle className="h-4 w-4" /> Shuffle the wall
                </button>
              )}
            </div>
            {order.length > 0 ? (
              <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
                {order.map((t, i) => <Note key={t._id} t={t} i={i} />)}
              </div>
            ) : (
              <p className="text-sm text-[#111111]/50">No community stories yet — add them in /sbh-1111/testimonials.</p>
            )}
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section id="cta" className="bg-[#C6FF3A] py-20 lg:py-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}
            className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <div>
              <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.14em] text-[#111111]/60">There&rsquo;s space on the wall</motion.p>
              <motion.h2 variants={fadeUp} className="mt-4 max-w-3xl text-balance text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">Pin your story up next.</motion.h2>
            </div>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <a href="/apply?source=community" className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-4 text-base font-bold text-white transition hover:translate-y-[-2px] hover:bg-[#003CD1]">
                Apply to Join <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
              <a href="/community" className="inline-flex items-center gap-2 rounded-full border border-[#111111]/25 px-8 py-4 text-base font-semibold text-[#111111] transition hover:bg-[#111111]/5">
                Explore Ecosystem
              </a>
            </motion.div>
          </motion.div>
        </section>

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
