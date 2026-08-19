/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import type { CaseStudy } from "@/components/ServicesPageClient";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { WordReveal } from "@/components/WordReveal";
import { AmbientBackground } from "@/components/AmbientBackground";
import { SectionWave } from "@/components/SectionWave";

export type { CaseStudy };

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } },
};
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

function CaseStudyCard({ cs, index }: { cs: CaseStudy; index: number }) {
  return (
    <Link href={`/case-studies/${cs._id}`}>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: (index % 3) * 0.08, ease: E } }}
        viewport={{ once: true, margin: "-60px" }}
        whileHover={{ y: -8, transition: { duration: 0.3, ease: E } }}
        className="group relative h-full overflow-hidden rounded-3xl border border-ink/5 bg-background transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)]"
      >
        {/* Image Section */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-sand to-ink/10">
          {cs.imageUrl && (
            <img
              src={cs.imageUrl}
              alt={cs.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Tag Badge */}
          <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
            {cs.tag}
          </div>

          {/* Result Badge (Top Right) */}
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-bold text-primary-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Key Result
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col p-8">
          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-4">
            {cs.title}
          </h3>

          {/* Client Name (if available) */}
          {cs.clientName && (
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-4">
              {cs.clientName}
            </p>
          )}

          {/* Problem Section */}
          <div className="mb-6 pb-6 border-b border-ink/10">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/40 mb-2">
              The Challenge
            </p>
            <p className="text-sm leading-relaxed text-ink/70 line-clamp-2">
              {cs.problem}
            </p>
          </div>

          {/* Strategy Section */}
          <div className="mb-6 pb-6 border-b border-ink/10">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/40 mb-2">
              The Strategy
            </p>
            <p className="text-sm leading-relaxed text-ink/70 line-clamp-2">
              {cs.strategy}
            </p>
          </div>

          {/* Results Highlight */}
          <div className="mb-auto">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2">
              The Impact
            </p>
            <p className="text-sm font-semibold text-ink line-clamp-2">
              {cs.results}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-6 flex items-center justify-between pt-6 border-t border-ink/10">
            <span className="text-xs font-semibold text-ink/50 transition group-hover:text-ink">
              View full case study
            </span>
            <span className="text-primary transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>

        {/* Hover Shimmer Effect */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 0 1px oklch(0.45 0.22 264 / 0.2)" }}
        />
      </motion.article>
    </Link>
  );
}

export function CaseStudiesPageClient({
  caseStudies,
  siteSettings,
}: {
  caseStudies: CaseStudy[];
  siteSettings: SiteSettings;
}) {
  return (
    <>
      <NavBar activePage="Services" ctaText="Book a Call" ctaHref="https://ntis.in/7oApLV" />
      <main className="bg-background font-sans text-ink">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-ink pt-32 pb-20 lg:pt-40 lg:pb-28">
          <AmbientBackground tone="dark" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.12)}>
              <motion.div
                variants={fadeUp}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Selected Work
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                variants={stagger(0.06)}
                className="max-w-3xl text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tight text-white"
              >
                <WordReveal text="Results that" mode="nested" staggerDelay={0.07} />
                {" "}
                <span className="relative inline-block">
                  <span className="relative z-10">
                    <WordReveal text="compound." mode="nested" staggerDelay={0.07} />
                  </span>
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-accent md:h-5" />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-white/50">
                Real brands. Real numbers. Real transformations. Explore how we've helped founders build lasting visibility.
              </motion.p>
            </motion.div>
          </div>
        </section>
        <SectionWave from="var(--ink)" to="var(--background)" />

        {/* ══ CASE STUDIES GRID ═════════════════════════════════════════ */}
        <section className="bg-background py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            {caseStudies.length === 0 ? (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger(0.1)}
                className="py-32 text-center"
              >
                <motion.p variants={fadeUp} className="text-lg font-semibold text-ink/30">
                  No case studies yet.
                </motion.p>
                <motion.p variants={fadeUp} className="mt-1 text-sm text-ink/20">
                  Add them in the admin at /sbh-1111/case-studies
                </motion.p>
              </motion.div>
            ) : (
              <>
                {/* Filter/Sort Info */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={fadeUp}
                  className="mb-12 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                      Portfolio
                    </p>
                    <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">
                      Our Latest Work
                    </h2>
                  </div>
                  <div className="hidden text-right lg:block">
                    <p className="text-sm font-semibold text-ink/60">
                      {caseStudies.length} case{caseStudies.length !== 1 ? "s" : ""} studies
                    </p>
                  </div>
                </motion.div>

                {/* Grid */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={stagger(0.08)}
                  className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                >
                  {caseStudies.map((cs, index) => (
                    <CaseStudyCard key={cs._id} cs={cs} index={index} />
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </section>
        <SectionWave from="var(--background)" to="var(--cream)" />

        {/* ══ STATS SECTION ═════════════════════════════════════════════ */}
        {caseStudies.length > 0 && (
          <>
            <section className="bg-cream py-20 lg:py-28">
              <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={stagger(0.12)}
                  className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                >
                  <motion.div variants={fadeUp} className="flex flex-col gap-3">
                    <p className="text-5xl md:text-6xl font-black text-primary">
                      {caseStudies.length}+
                    </p>
                    <p className="text-sm font-semibold text-ink/70">
                      Success stories we've created
                    </p>
                  </motion.div>

                  <motion.div variants={fadeUp} className="flex flex-col gap-3">
                    <p className="text-5xl md:text-6xl font-black text-primary">
                      100%
                    </p>
                    <p className="text-sm font-semibold text-ink/70">
                      Client satisfaction rate
                    </p>
                  </motion.div>

                  <motion.div variants={fadeUp} className="flex flex-col gap-3">
                    <p className="text-5xl md:text-6xl font-black text-primary">
                      2M+
                    </p>
                    <p className="text-sm font-semibold text-ink/70">
                      Combined reach achieved
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </section>
            <SectionWave from="var(--cream)" to="var(--primary)" />
          </>
        )}

        {/* ══ CTA SECTION ═══════════════════════════════════════════════ */}
        <section className="bg-primary py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger(0.12)}
            >
              <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">
                Let&apos;s work together
              </motion.p>
              <motion.h2 variants={fadeUp} className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-white">
                Ready to create your own success story?
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-6 max-w-2xl mx-auto text-lg text-white/70">
                Join the brands we've helped build lasting visibility and achieve measurable growth through strategic content and community.
              </motion.p>
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
