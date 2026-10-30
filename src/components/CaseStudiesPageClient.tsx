/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import NavBar from "@/components/NavBar";
import type { CaseStudy } from "@/components/ServicesPageClient";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { headlineMetric } from "@/components/LandingPrimitives";
import { extractMainLine } from "@/components/ExpandableQuote";
import { Circled, DoodleArrow, Grain } from "@/components/founder/HandDrawn";

export type { CaseStudy };

const E = [0.22, 1, 0.36, 1] as const;
const BOOKING_URL = "https://ntis.in/7oApLV";

/* Admin tags are free text ("PersonalBranding", "Social Media Growth ", …), so
 * each study is filed under one of a few plain categories for the filter. */
const CATEGORIES = ["All work", "Personal branding", "Social & video", "Creator campaigns"] as const;
type Category = (typeof CATEGORIES)[number];

function categoryOf(c: CaseStudy): Exclude<Category, "All work"> {
  const s = `${c.tag} ${c.title}`.toLowerCase();
  if (/creator|influencer|campaign/.test(s)) return "Creator campaigns";
  if (/video|social|reel|youtube|instagram/.test(s) && !/linkedin/.test(c.tag.toLowerCase())) return "Social & video";
  return "Personal branding";
}

/** The brand/person a study is about: the admin's client name, else the part of
 * the title before a colon ("MindSmith: Scaling…" → "MindSmith"). */
function brandOf(c: CaseStudy): string | null {
  if (c.clientName?.trim()) return c.clientName.trim();
  const head = c.title.split(":")[0];
  return head !== c.title && head.length <= 40 ? head.trim() : null;
}

export function CaseStudiesPageClient({ caseStudies, siteSettings }: { caseStudies: CaseStudy[]; siteSettings: SiteSettings }) {
  const [filter, setFilter] = useState<Category>("All work");

  const counts = useMemo(() => {
    const m = new Map<Category, number>([["All work", caseStudies.length]]);
    for (const c of caseStudies) m.set(categoryOf(c), (m.get(categoryOf(c)) ?? 0) + 1);
    return m;
  }, [caseStudies]);

  const shown = filter === "All work" ? caseStudies : caseStudies.filter((c) => categoryOf(c) === filter);
  const [featured, ...rest] = shown;
  const proof = caseStudies
    .map((c) => ({ c, m: headlineMetric(c) }))
    .filter((x): x is { c: CaseStudy; m: { value: string; label: string } } => Boolean(x.m));

  return (
    <>
      <NavBar activePage="Services" ctaText="Book a Call" ctaHref={BOOKING_URL} />
      <main className="bg-background font-sans text-ink">
        <Hero proof={proof} total={caseStudies.length} />

        <section id="work" className="relative bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            {caseStudies.length === 0 ? (
              <div className="py-32 text-center">
                <p className="text-lg font-semibold text-ink/30">No case studies yet.</p>
                <p className="mt-1 text-sm text-ink/25">Add them in the admin at /sbh-1111/case-studies</p>
              </div>
            ) : (
              <>
                {/* Filter */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">The work</p>
                    <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Pick a story.</h2>
                  </div>
                  <LayoutGroup id="case-filter">
                    <div role="tablist" aria-label="Filter case studies" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:px-0">
                      {CATEGORIES.filter((c) => (counts.get(c) ?? 0) > 0).map((c) => {
                        const on = c === filter;
                        return (
                          <button
                            key={c}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            onClick={() => setFilter(c)}
                            className={`relative shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary ${on ? "text-white" : "text-ink/60 hover:text-ink"}`}
                          >
                            {on && <motion.span layoutId="case-filter-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-ink" />}
                            {!on && <span className="absolute inset-0 rounded-full border border-ink/12" />}
                            <span className="relative">
                              {c} <span className={on ? "text-accent" : "text-ink/35"}>{counts.get(c)}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </LayoutGroup>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={filter}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: E }}
                  >
                    {featured && <Featured cs={featured} />}
                    {rest.length > 0 && <StoryIndex stories={rest} startAt={2} />}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>
        </section>

        {proof.length > 0 && <ProofBoard proof={proof} />}

        <ClosingCTA />
        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────────── */

function Hero({ proof, total }: { proof: { c: CaseStudy; m: { value: string; label: string } }[]; total: number }) {
  const reduced = usePrefersReducedMotion();
  const words = ["Results", "that"];
  const ticker = [...proof, ...proof];
  return (
    <section className="relative overflow-hidden bg-ink pt-32 text-white lg:pt-40">
      <AmbientBackground tone="dark" />
      <Grain opacity={0.06} />
      <div className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-10 lg:pb-20">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: E }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Selected work · {total} stories
        </motion.p>

        <h1 className="mt-8 max-w-4xl text-[clamp(3rem,8vw,7rem)] font-black leading-[0.92] tracking-tight">
          {words.map((w, i) => (
            <motion.span key={w} className="inline-block"
              initial={{ opacity: 0, y: reduced ? 0 : 60, rotate: reduced ? 0 : i ? 4 : -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 + i * 0.1 }}>
              {w}&nbsp;
            </motion.span>
          ))}
          <motion.span className="inline-block"
            initial={{ opacity: 0, y: reduced ? 0 : 60, rotate: reduced ? 0 : -3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.32 }}>
            <Circled delay={0.9}><span className="text-gradient-lime">compound.</span></Circled>
          </motion.span>
        </h1>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-xl text-lg text-white/55">
            Real brands. Real numbers. Real transformations. Explore how we&rsquo;ve helped founders build lasting visibility.
          </motion.p>
          <motion.a href="#work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="group inline-flex w-fit items-center gap-3 text-sm font-semibold text-white">
            <DoodleArrow className="h-10 w-14 rotate-[70deg]" delay={1.4} />
            <span className="underline-offset-4 group-hover:underline">Read the stories</span>
          </motion.a>
        </div>
      </div>

      {/* Ticker of real results from the case studies */}
      {proof.length > 0 && (
        <div className="relative border-y border-white/10 bg-white/[0.03] py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className={`flex w-max items-center gap-10 ${reduced ? "" : "animate-[footer-marquee_32s_linear_infinite] hover:[animation-play-state:paused]"}`}>
            {ticker.map(({ c, m }, i) => (
              <Link key={`${c._id}-${i}`} href={`/case-studies/${c._id}`} aria-hidden={i >= proof.length} tabIndex={i >= proof.length ? -1 : 0}
                className="flex shrink-0 items-baseline gap-3 whitespace-nowrap">
                <span className="text-2xl font-black tracking-tight text-accent md:text-3xl">{m.value}</span>
                <span className="text-sm text-white/70">{m.label}</span>
                {brandOf(c) && <span className="text-sm text-white/35">· {brandOf(c)}</span>}
                <span aria-hidden="true" className="ml-6 h-1.5 w-1.5 rounded-full bg-primary" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Featured story ──────────────────────────────────────────────────────── */

function Featured({ cs }: { cs: CaseStudy }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const metric = headlineMetric(cs);
  const brand = brandOf(cs);
  const beats = [
    { k: "Before", v: cs.problem },
    { k: "What we did", v: cs.strategy },
    { k: "After", v: cs.results },
  ].filter((b) => b.v?.trim());

  return (
    <Link ref={ref} href={`/case-studies/${cs._id}`}
      className="group mt-12 grid overflow-hidden rounded-xl border border-ink/10 bg-ink text-white outline-none transition-shadow duration-500 hover:shadow-[0_40px_80px_-40px_rgba(0,60,209,0.6)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="relative flex items-center overflow-hidden bg-[#F4F4F2] lg:min-h-[460px]">
        {cs.imageUrl && (
          <motion.img src={cs.imageUrl} alt="" style={reduced ? undefined : { y: imgY }}
            className="aspect-video w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        )}
        <span className="absolute left-5 top-5 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">Featured story</span>
      </div>
      <div className="relative flex flex-col p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/45">
          01 · {categoryOf(cs)}{brand ? ` · ${brand}` : ""}
        </p>
        <h3 className="mt-4 text-balance text-2xl font-black leading-tight tracking-tight md:text-3xl">{cs.title}</h3>
        {metric && (
          <p className="mt-6 flex items-baseline gap-3">
            <span className="text-5xl font-black leading-none tracking-tight text-accent md:text-6xl">{metric.value}</span>
            <span className="text-sm text-white/55">{metric.label}</span>
          </p>
        )}
        <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } } }}
          className="mt-8 space-y-4 border-l border-white/15 pl-5">
          {beats.map((b, i) => (
            <motion.li key={b.k} variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: E } } }} className="relative">
              <span aria-hidden="true" className={`absolute -left-[25px] top-1.5 h-2 w-2 rounded-full ${i === beats.length - 1 ? "bg-accent" : "bg-primary"}`} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">{b.k}</p>
              <p className={`mt-1 text-sm leading-relaxed ${i === beats.length - 1 ? "font-semibold text-white" : "text-white/60"}`}>{extractMainLine(b.v, 150)}</p>
            </motion.li>
          ))}
        </motion.ol>
        <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold">
          Read the full story
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

/* ── Story index: editorial rows; the cover follows the cursor ────────────── */

function StoryIndex({ stories, startAt }: { stories: CaseStudy[]; startAt: number }) {
  const reduced = usePrefersReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const tilt = useSpring(useTransform(x, (v) => (v % 400) / 400 - 0.5), { stiffness: 120, damping: 20 });
  const rotate = useTransform(tilt, [-0.5, 0.5], [-5, 5]);
  const active = stories.find((s) => s._id === hovered);

  return (
    <div
      ref={box}
      className="relative mt-16"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !box.current) return;
        const r = box.current.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setHovered(null)}
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-ink/40">More stories</p>
      <ol className="border-t border-ink/10">
        {stories.map((cs, i) => {
          const metric = headlineMetric(cs);
          const brand = brandOf(cs);
          const on = hovered === cs._id;
          return (
            <motion.li key={cs._id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: E, delay: i * 0.06 }}
              className="border-b border-ink/10">
              <Link href={`/case-studies/${cs._id}`}
                onPointerEnter={(e) => { if (e.pointerType === "mouse") setHovered(cs._id); }}
                onFocus={() => setHovered(cs._id)}
                onBlur={() => setHovered(null)}
                className="group relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-3 py-7 outline-none focus-visible:bg-sand md:grid-cols-[3rem_1fr_11rem_2rem] md:py-9">
                {/* lime wash sweeping in behind the row */}
                <span aria-hidden="true" className={`absolute inset-y-1 -left-3 -right-3 origin-left rounded-md bg-accent/25 transition-transform duration-500 ease-out ${on ? "scale-x-100" : "scale-x-0"}`} />
                <span className="relative text-sm font-semibold tabular-nums text-ink/35">{String(i + startAt).padStart(2, "0")}</span>
                <span className="relative min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                    {categoryOf(cs)}{brand ? <span className="text-ink/40"> · {brand}</span> : null}
                  </span>
                  <span className={`mt-1.5 block text-balance text-xl font-black leading-snug tracking-tight transition-transform duration-500 md:text-2xl ${on ? "translate-x-2" : ""}`}>
                    {cs.title}
                  </span>
                  {/* phones: cover inline */}
                  {cs.imageUrl && <img src={cs.imageUrl} alt="" className="mt-4 aspect-video w-full rounded-md border border-ink/10 object-cover md:hidden" />}
                </span>
                <span className="relative col-start-3 row-start-1 text-right md:col-start-auto md:row-start-auto">
                  {metric ? (
                    <>
                      <span className="block text-2xl font-black leading-none tracking-tight text-primary md:text-3xl">{metric.value}</span>
                      <span className="mt-1 block text-xs text-ink/50">{metric.label}</span>
                    </>
                  ) : null}
                </span>
                <span aria-hidden="true" className="relative hidden h-8 w-8 place-items-center rounded-full border border-ink/15 transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-accent md:grid">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ol>

      {/* Desktop: the hovered story's cover floats with the cursor */}
      {!reduced && (
        <motion.div aria-hidden="true" style={{ x: sx, y: sy, rotate }}
          className="pointer-events-none absolute left-0 top-0 z-20 hidden w-[320px] translate-x-6 -translate-y-[108%] md:block">
          <AnimatePresence>
            {active?.imageUrl && (
              <motion.img key={active._id} src={active.imageUrl} alt=""
                initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="aspect-video w-full rounded-lg border-4 border-white object-cover shadow-[0_30px_60px_-20px_rgba(17,17,17,0.55)]" />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ── Proof board: the real numbers, counting up ──────────────────────────── */

function ProofBoard({ proof }: { proof: { c: CaseStudy; m: { value: string; label: string } }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
      <AmbientBackground tone="light" />
      <div ref={ref} className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">The numbers</p>
        <h2 className="mt-3 max-w-2xl text-balance text-4xl font-black tracking-tight md:text-5xl">Straight from the reports.</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {proof.slice(0, 4).map(({ c, m }, i) => (
            <motion.div key={c._id}
              initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: E, delay: i * 0.1 }}
              className="flex flex-col bg-background p-7">
              <span className="text-5xl font-black tracking-tight text-primary md:text-6xl">
                <AnimatedNumber value={m.value.replace(/%$/, "")} inView={inView} />{m.value.endsWith("%") ? "%" : ""}
              </span>
              <span className="mt-2 text-sm font-semibold text-ink/75">{m.label}</span>
              <Link href={`/case-studies/${c._id}`} className="mt-auto pt-6 text-xs font-semibold text-ink/45 underline-offset-4 hover:text-primary hover:underline">
                {brandOf(c) ?? "See the story"} →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Closing CTA ─────────────────────────────────────────────────────────── */

function ClosingCTA() {
  const reduced = usePrefersReducedMotion();
  const row = Array.from({ length: 8 }, () => "Your story next");
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#003CD1_0%,#002A93_55%,#0B1640_100%)] py-20 text-white lg:py-28">
      <Grain opacity={0.05} />
      {/* a slow, oversized line of text drifting behind the CTA */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none opacity-[0.08]">
        <div className={`flex w-max gap-12 whitespace-nowrap text-[clamp(4rem,12vw,10rem)] font-semibold leading-none tracking-tighter ${reduced ? "" : "animate-[footer-marquee_40s_linear_infinite]"}`}>
          {[...row, ...row].map((t, i) => <span key={i}>{t} →</span>)}
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: E }}
        className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">Let&apos;s work together</p>
        <h2 className="mt-4 text-balance text-4xl font-black tracking-tight md:text-6xl">Ready to create your own success story?</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
          Join the brands we&apos;ve helped build lasting visibility and achieve measurable growth through strategic content and community.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <motion.a href={BOOKING_URL} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
            className="glow-lime inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-ink">
            Book a Strategy Call →
          </motion.a>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
            View Our Services
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
