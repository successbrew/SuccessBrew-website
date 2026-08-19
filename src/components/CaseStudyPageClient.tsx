/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { CaseStudy } from "@prisma/client";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { SectionWave } from "@/components/SectionWave";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const E = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } },
};

const stagger = (d = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: d } },
});

interface CaseStudyPageClientProps {
  caseStudy: CaseStudy;
  relatedStudies: CaseStudy[];
  siteSettings: SiteSettings;
}

function AnimatedCounter({ value, label, inView }: { value: string; label: string; inView: boolean }) {
  const [count, setCount] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (!inView || reducedMotion) {
      const match = value.match(/^([\d,]+)([KMkm%+]*)$/);
      if (match) setCount(parseInt(match[1].replace(/,/g, ""), 10));
      return;
    }

    const match = value.match(/^([\d,]+)([KMkm%+]*)$/);
    if (!match) return;

    const target = parseInt(match[1].replace(/,/g, ""), 10);
    const suffix = match[2] || "";
    const duration = 1400;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    tick();
  }, [value, inView, reducedMotion]);

  const match = value.match(/^([\d,]+)([KMkm%+]*)$/);
  const suffix = match?.[2] || "";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-primary">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-sm md:text-base font-semibold text-ink/60 text-center">{label}</p>
    </div>
  );
}

export function CaseStudyPageClient({
  caseStudy,
  relatedStudies,
  siteSettings,
}: CaseStudyPageClientProps) {
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const [resultsInView, setResultsInView] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setResultsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (resultsRef.current) {
      observer.observe(resultsRef.current);
    }

    return () => {
      if (resultsRef.current) {
        observer.unobserve(resultsRef.current);
      }
    };
  }, []);

  // Parse JSON fields with fallback
  const parseJson = (data: any, defaultValue: any = []) => {
    if (!data) return defaultValue;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return defaultValue;
      }
    }
    return data || defaultValue;
  };

  const heroMetrics = parseJson(caseStudy.heroMetrics, []);
  const beforeAfter = parseJson(caseStudy.beforeAfter, null);
  const strategySteps = parseJson(caseStudy.strategySteps, []);
  const resultMetrics = parseJson(caseStudy.resultMetrics, []);
  const timelineSteps = parseJson(caseStudy.timelineSteps, []);

  const primaryMetric = heroMetrics[0] || null;

  return (
    <>
      <NavBar activePage="Services" ctaText="Book a Call" ctaHref="https://ntis.in/7oApLV" />
      <main className="bg-background font-sans text-ink">
        {/* ══ HERO SECTION ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-ink pt-32 pb-20 lg:pt-40 lg:pb-32">
          <AmbientBackground tone="dark" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.12)}>
              {/* Label */}
              <motion.div
                variants={fadeUp}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Case Study
              </motion.div>

              {/* Primary Metric or Title */}
              {primaryMetric ? (
                <>
                  <motion.div variants={fadeUp} className="mb-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-white/40">
                      Key Result
                    </p>
                    <div className="mt-6 text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white">
                      <span className="text-accent">{primaryMetric.value}</span>
                    </div>
                    <p className="mt-4 text-xl md:text-2xl text-white/80">
                      {primaryMetric.label}
                    </p>
                  </motion.div>
                  <motion.h1 variants={fadeUp} className="max-w-4xl text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white">
                    How SuccessBrew transformed {caseStudy.clientName || "the client"}'s{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10">{caseStudy.title}</span>
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-2 -z-0 h-3 bg-accent md:h-5" />
                    </span>
                  </motion.h1>
                </>
              ) : (
                <motion.h1
                  variants={fadeUp}
                  className="max-w-4xl text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white"
                >
                  {caseStudy.title}
                </motion.h1>
              )}

              {/* Description */}
              {caseStudy.description && (
                <motion.p
                  variants={fadeUp}
                  className="mt-8 max-w-2xl text-lg md:text-xl text-white/70"
                >
                  {caseStudy.description}
                </motion.p>
              )}

              {/* Meta Info */}
              <motion.div
                variants={fadeUp}
                className="mt-12 flex flex-wrap items-center gap-8 border-t border-white/10 pt-8"
              >
                {caseStudy.clientName && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                      Client
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {caseStudy.clientName}
                    </p>
                  </div>
                )}
                {caseStudy.tag && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                      Service
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {caseStudy.tag}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* CTA */}
              {caseStudy.pdfUrl && (
                <motion.div variants={fadeUp} className="mt-12">
                  <a
                    href={caseStudy.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-ink shadow-[0_10px_40px_-10px_rgba(193,255,59,0.5)] transition hover:translate-y-[-2px]"
                  >
                    📄 View Full Case Study PDF
                  </a>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
        <SectionWave from="var(--ink)" to="var(--background)" />

        {/* ══ CHALLENGE SECTION ═════════════════════════════════════════════ */}
        <section className="bg-background py-20 lg:py-32">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.12)}
            >
              <motion.div variants={fadeUp} className="mb-8">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  01 · The Challenge
                </span>
                <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
                  The Problem
                </h2>
              </motion.div>

              <motion.div variants={fadeUp} className="prose prose-lg max-w-none">
                <p className="text-lg md:text-xl leading-relaxed text-ink/80">
                  {caseStudy.problem}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <SectionWave from="var(--background)" to="var(--cream)" />

        {/* ══ BEFORE → AFTER SECTION ════════════════════════════════════════ */}
        {beforeAfter && beforeAfter.before && beforeAfter.after && (
          <>
            <section className="bg-cream py-20 lg:py-32">
              <div className="mx-auto max-w-6xl px-6 lg:px-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={stagger(0.12)}
                >
                  <motion.div variants={fadeUp} className="mb-12 text-center">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                      The Transformation
                    </h2>
                  </motion.div>

                  <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
                    {/* Before */}
                    <motion.div
                      variants={fadeUp}
                      className="flex flex-col gap-6 rounded-3xl border border-ink/10 bg-background p-8 md:p-10"
                    >
                      <h3 className="text-2xl font-bold text-ink/80">Before</h3>
                      <p className="text-base leading-relaxed text-ink/70">
                        {beforeAfter.before}
                      </p>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      variants={fadeUp}
                      className="hidden flex-col items-center justify-center gap-4 text-ink/30 md:flex"
                    >
                      <div className="text-4xl">→</div>
                    </motion.div>

                    {/* After */}
                    <motion.div
                      variants={fadeUp}
                      className="flex flex-col gap-6 rounded-3xl border border-primary/20 bg-primary/5 p-8 md:p-10 md:col-start-2 md:row-start-1"
                    >
                      <h3 className="text-2xl font-bold text-primary">After</h3>
                      <p className="text-base leading-relaxed text-ink/70">
                        {beforeAfter.after}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </section>
            <SectionWave from="var(--cream)" to="var(--background)" />
          </>
        )}

        {/* ══ STRATEGY SECTION ══════════════════════════════════════════════ */}
        {(strategySteps.length > 0 || caseStudy.strategy) && (
          <>
            <section className="bg-background py-20 lg:py-32">
              <div className="mx-auto max-w-6xl px-6 lg:px-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={stagger(0.12)}
                >
                  <motion.div variants={fadeUp} className="mb-12">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      02 · The Strategy
                    </span>
                    <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
                      The SuccessBrew Playbook
                    </h2>
                  </motion.div>

                  {strategySteps.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {strategySteps.map((step: any, idx: number) => (
                        <motion.div
                          key={idx}
                          variants={fadeUp}
                          className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-sand/40 p-6 md:p-8"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                              {String(idx + 1).padStart(2, "0")}
                            </div>
                          </div>
                          <h3 className="text-lg md:text-xl font-bold tracking-tight">
                            {step.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-ink/70">
                            {step.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.p variants={fadeUp} className="text-lg leading-relaxed text-ink/80">
                      {caseStudy.strategy}
                    </motion.p>
                  )}
                </motion.div>
              </div>
            </section>
            <SectionWave from="var(--background)" to="var(--sand)" />
          </>
        )}

        {/* ══ SOLUTION SECTION ══════════════════════════════════════════════ */}
        {caseStudy.solutionContent && (
          <>
            <section className="bg-sand py-20 lg:py-32">
              <div className="mx-auto max-w-4xl px-6 lg:px-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={stagger(0.12)}
                >
                  <motion.div variants={fadeUp} className="mb-8">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      03 · The Solution
                    </span>
                    <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
                      What We Built
                    </h2>
                  </motion.div>

                  <motion.div variants={fadeUp} className="prose prose-lg max-w-none">
                    <p className="text-lg md:text-xl leading-relaxed text-ink/80">
                      {caseStudy.solutionContent}
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </section>
            <SectionWave from="var(--sand)" to="var(--background)" />
          </>
        )}

        {/* ══ RESULTS SECTION ═══════════════════════════════════════════════ */}
        {resultMetrics.length > 0 && (
          <>
            <section ref={resultsRef} className="bg-background py-20 lg:py-32">
              <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={stagger(0.12)}
                >
                  <motion.div variants={fadeUp} className="mb-16 text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      04 · The Impact
                    </span>
                    <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
                      The Results
                    </h2>
                  </motion.div>

                  <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {resultMetrics.map((metric: any, idx: number) => (
                      <motion.div
                        key={idx}
                        variants={fadeUp}
                        className="flex flex-col items-center gap-4 rounded-2xl border border-ink/5 bg-sand/40 p-8 md:p-10"
                      >
                        <AnimatedCounter
                          value={metric.value}
                          label={metric.label}
                          inView={resultsInView}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
            <SectionWave from="var(--background)" to="var(--cream)" />
          </>
        )}

        {/* ══ TIMELINE SECTION ══════════════════════════════════════════════ */}
        {timelineSteps.length > 0 && (
          <>
            <section className="bg-cream py-20 lg:py-32">
              <div className="mx-auto max-w-4xl px-6 lg:px-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={stagger(0.12)}
                >
                  <motion.div variants={fadeUp} className="mb-12 text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      The Journey
                    </span>
                    <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
                      Project Timeline
                    </h2>
                  </motion.div>

                  <div className="space-y-8">
                    {timelineSteps
                      .sort(
                        (a: any, b: any) => (a.order || 0) - (b.order || 0)
                      )
                      .map((step: any, idx: number) => (
                        <motion.div
                          key={idx}
                          variants={fadeUp}
                          className="flex gap-6"
                        >
                          <div className="flex flex-col items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold">
                              {idx + 1}
                            </div>
                            {idx < timelineSteps.length - 1 && (
                              <div className="h-12 w-1 bg-primary/20" />
                            )}
                          </div>
                          <div className="flex-1 pt-2">
                            <h3 className="text-lg md:text-xl font-bold">
                              {step.title}
                            </h3>
                            <p className="mt-2 text-ink/70">
                              {step.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              </div>
            </section>
            <SectionWave from="var(--cream)" to="var(--background)" />
          </>
        )}

        {/* ══ PDF CTA SECTION ═══════════════════════════════════════════════ */}
        {caseStudy.pdfUrl && (
          <>
            <section className="bg-background py-20 lg:py-32">
              <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger(0.12)}
                >
                  <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                    Deep Dive
                  </motion.p>
                  <motion.h2 variants={fadeUp} className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
                    Want the complete breakdown?
                  </motion.h2>
                  <motion.p variants={fadeUp} className="mt-6 text-lg text-ink/70">
                    Explore the full strategy, execution, and results in our detailed case study PDF.
                  </motion.p>
                  <motion.div variants={fadeUp} className="mt-10">
                    <a
                      href={caseStudy.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-ink shadow-[0_10px_40px_-10px_rgba(193,255,59,0.5)] transition hover:translate-y-[-2px]"
                    >
                      📄 View Full Case Study
                    </a>
                  </motion.div>
                </motion.div>
              </div>
            </section>
            <SectionWave from="var(--background)" to="var(--sand)" />
          </>
        )}

        {/* ══ RELATED CASE STUDIES ══════════════════════════════════════════ */}
        {relatedStudies.length > 0 && (
          <>
            <section className="bg-sand py-20 lg:py-32">
              <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={stagger(0.12)}
                >
                  <motion.div variants={fadeUp} className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                      More Success Stories
                    </h2>
                  </motion.div>

                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {relatedStudies.map((study) => (
                      <Link
                        key={study.id}
                        href={`/case-studies/${study.id}`}
                      >
                        <motion.article
                          variants={fadeUp}
                          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-background transition hover:border-primary/30"
                        >
                          <div className="relative h-48 overflow-hidden bg-ink/5">
                            {study.imageUrl && (
                              <img
                                src={study.imageUrl}
                                alt={study.title}
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                            )}
                          </div>
                          <div className="flex flex-1 flex-col gap-3 p-6">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">
                              {study.tag}
                            </span>
                            <h3 className="text-lg font-bold tracking-tight">
                              {study.title}
                            </h3>
                            <p className="line-clamp-2 text-sm text-ink/60">
                              {study.results}
                            </p>
                            <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-ink/50 transition group-hover:gap-2.5 group-hover:text-ink">
                              View case study
                              <span aria-hidden="true">→</span>
                            </span>
                          </div>
                        </motion.article>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
            <SectionWave from="var(--sand)" to="var(--primary)" />
          </>
        )}

        {/* ══ FINAL CTA ═════════════════════════════════════════════════════ */}
        <section className="bg-primary py-20 lg:py-32">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger(0.12)}
            >
              <motion.p
                variants={fadeUp}
                className="text-xs font-bold uppercase tracking-[0.22em] text-white/50"
              >
                Let&apos;s work together
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-white"
              >
                Ready to create your own success story?
              </motion.h2>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://ntis.in/7oApLV"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-ink shadow-[0_10px_40px_-10px_rgba(193,255,59,0.5)] transition hover:translate-y-[-2px]"
                >
                  Book a Strategy Call
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  View Our Services
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <SectionWave from="var(--primary)" to="var(--ink)" />

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
