/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import type { Testimonial } from "@/components/ServicesPageClient";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { extractMainLine } from "@/components/ExpandableQuote";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });
const HOLD_MS = 7000;
const BOOKING_URL = "https://ntis.in/7oApLV";

interface Props { testimonials: Testimonial[]; siteSettings: SiteSettings }

function Avatar({ t, size = "h-12 w-12" }: { t: Testimonial; size?: string }) {
  return t.avatarUrl ? (
    <img src={t.avatarUrl} alt={t.name} className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <span className={`${size} grid shrink-0 place-items-center rounded-full text-sm font-bold ${t.avatarStyle === "accent" ? "bg-accent text-ink" : "bg-primary text-white"}`}>{t.initial}</span>
  );
}

/** The hero *is* a testimonial: one founder's line at a time, set huge, with a
 * timer bar and manual controls. Pauses on hover/focus and under reduced motion. */
function QuoteStage({ items }: { items: Testimonial[] }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  const auto = !reduced && !paused && n > 1;

  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % n), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [auto, i, n]);

  const t = items[i];
  if (!t) return null;
  const words = extractMainLine(t.quote, 150).split(" ");

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {/* Only announce changes the visitor asked for — not every auto-advance. */}
      <div className="min-h-[15rem] sm:min-h-[17rem] lg:min-h-[19rem]" aria-live={auto ? "off" : "polite"}>
        <AnimatePresence mode="wait">
          <motion.figure key={t._id} initial="hidden" animate="visible" exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}>
            <blockquote className="text-balance text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.12] tracking-tight text-[#FFF3D0]">
              <motion.span variants={stagger(reduced ? 0 : 0.025)}>
                <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-accent">&ldquo;</motion.span>
                {words.map((w, k) => (
                  <motion.span key={k} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: E } } }}
                    className="inline-block">{w}&nbsp;</motion.span>
                ))}
                <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-accent">&rdquo;</motion.span>
              </motion.span>
            </blockquote>
            <motion.figcaption variants={fadeUp} className="mt-8 flex items-center gap-4">
              <Avatar t={t} />
              <div>
                <p className="font-bold text-white">{t.name}</p>
                <p className="line-clamp-1 text-sm text-white/50">{t.role}</p>
              </div>
            </motion.figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {n > 1 && (
        <div className="mt-10 flex items-center gap-5">
          <button type="button" onClick={() => setI((v) => (v - 1 + n) % n)} aria-label="Previous testimonial"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => setI((v) => (v + 1) % n)} aria-label="Next testimonial"
            className="grid h-11 w-11 place-items-center rounded-full bg-accent text-ink transition hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></button>
          <div className="relative h-px flex-1 bg-white/15">
            <motion.div key={`${i}-${auto}`} initial={{ scaleX: 0 }} animate={{ scaleX: auto ? 1 : 0 }}
              transition={{ duration: auto ? HOLD_MS / 1000 : 0, ease: "linear" }}
              className="absolute inset-0 origin-left bg-accent" />
          </div>
          <span className="text-xs font-semibold tabular-nums text-white/50">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
        </div>
      )}
    </div>
  );
}

/** Name index + reading pane: every founder listed on the left, the chosen
 * one's full words on the right. Below lg it folds into an accordion. */
function Reader({ items }: { items: Testimonial[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const t = items[active];

  return (
    <>
      {/* Desktop */}
      <div className="hidden gap-14 lg:grid lg:grid-cols-[22rem_1fr]">
        <ol className="border-t border-ink/10">
          {items.map((x, k) => {
            const on = k === active;
            return (
              <li key={x._id} className="border-b border-ink/10">
                <button type="button" onMouseEnter={() => setActive(k)} onFocus={() => setActive(k)} onClick={() => setActive(k)} aria-pressed={on}
                  className="group relative flex w-full items-center gap-4 py-4 text-left">
                  {on && <motion.span layoutId="reader-mark" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }}
                    className="absolute -left-4 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-primary" />}
                  <span className={`w-6 text-[11px] font-semibold tabular-nums ${on ? "text-primary" : "text-ink/35"}`}>{String(k + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className={`block truncate text-lg font-bold transition-colors ${on ? "text-ink" : "text-ink/45 group-hover:text-ink/80"}`}>{x.name}</span>
                    <span className="block truncate text-xs text-ink/45">{x.role}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="sticky top-28 self-start">
          <AnimatePresence mode="wait">
            {t && (
              <motion.figure key={t._id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: reduced ? 0 : 0.35, ease: E }}
                className="relative overflow-hidden rounded-[2rem] bg-white p-10 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.35)] xl:p-14">
                <span aria-hidden className="absolute -right-2 -top-10 text-[14rem] font-black leading-none text-primary/[0.07]">&rdquo;</span>
                <div className="relative flex items-center gap-4">
                  <Avatar t={t} size="h-14 w-14" />
                  <div>
                    <p className="text-xl font-black">{t.name}</p>
                    <p className="text-sm text-ink/55">{t.role}</p>
                  </div>
                </div>
                <blockquote className="relative mt-8 max-h-[52vh] overflow-y-auto whitespace-pre-line pr-2 text-xl leading-relaxed text-ink/80 xl:text-2xl xl:leading-relaxed">
                  {t.quote}
                </blockquote>
              </motion.figure>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile / tablet */}
      <ol className="border-t border-ink/10 lg:hidden">
        {items.map((x, k) => {
          const on = open === k;
          return (
            <li key={x._id} className="border-b border-ink/10">
              <button type="button" onClick={() => setOpen(on ? null : k)} aria-expanded={on} className="flex w-full items-center gap-4 py-4 text-left">
                <Avatar t={x} size="h-10 w-10" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{x.name}</span>
                  <span className="block truncate text-xs text-ink/50">{x.role}</span>
                </span>
                <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 text-lg leading-none transition-transform duration-300 ${on ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <blockquote className="whitespace-pre-line pb-6 text-base leading-relaxed text-ink/75">{x.quote}</blockquote>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function TestimonialsPageClient({ testimonials, siteSettings }: Props) {
  // The stage reads best with the punchiest lines, so feature the shortest quotes first.
  const staged = [...testimonials].sort((a, b) => a.quote.length - b.quote.length).slice(0, 6);

  return (
    <>
      <NavBar activePage="Services" ctaText="Book a Call" ctaHref={BOOKING_URL} />
      <main className="bg-background font-sans text-ink">

        {/* ══ HERO — the quote stage ═══════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#111111] pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/40 blur-[150px]" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)} className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-6">
              <motion.h1 variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
                Real founders. Real words.
              </motion.h1>
              <motion.p variants={fadeUp} className="text-sm text-white/50">
                {testimonials.length} founder{testimonials.length !== 1 ? "s" : ""} · unedited, unprompted, unsponsored
              </motion.p>
            </motion.div>
            {staged.length > 0 ? (
              <QuoteStage items={staged} />
            ) : (
              <p className="text-white/50">No testimonials yet — add them in the Studio.</p>
            )}
          </div>
        </section>

        {/* ══ READER ═══════════════════════════════════════════════════════ */}
        {testimonials.length > 0 && (
          <section className="bg-cream py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)} className="mb-12 max-w-2xl">
                <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">The full record</motion.p>
                <motion.h2 variants={fadeUp} className="mt-3 text-balance text-4xl font-black tracking-tight md:text-6xl">Every founder, in full.</motion.h2>
                <motion.p variants={fadeUp} className="mt-4 text-ink/60">Pick a name to read what they said — the whole thing, not a pull quote.</motion.p>
              </motion.div>
              <Reader items={testimonials} />
            </div>
          </section>
        )}

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#003CD1_0%,#002A93_55%,#0B1640_100%)] py-20 text-white lg:py-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}
            className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:px-10">
            <div>
              <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Ready to join them?</motion.p>
              <motion.h2 variants={fadeUp} className="mt-4 text-balance text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">Your quote goes here next.</motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <p className="max-w-md text-lg text-white/70">Book a 30-minute strategy call — no pitch, just clarity on what your next 90 days could look like.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={BOOKING_URL} className="glow-lime inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-ink transition hover:translate-y-[-2px]">
                  Book a Strategy Call <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
                <Link href="/#work" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                  See the work
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
