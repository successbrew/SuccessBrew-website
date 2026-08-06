"use client";

import React from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import type { Testimonial } from "@/components/ServicesPageClient";
import { Footer } from "@/components/Footer";
import { WordReveal } from "@/components/WordReveal";
import { TestimonialEcosystem } from "@/components/TestimonialEcosystem";
import { SectionWave } from "@/components/SectionWave";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

interface Props {
  testimonials: Testimonial[];
  siteSettings: SiteSettings;
}

export function CommunityTestimonialsPageClient({ testimonials, siteSettings }: Props) {
  return (
    <>
      <NavBar activePage="Community" ctaText="Join Community" ctaHref="/apply" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#F2ECDD] pt-32 pb-20 lg:pt-44 lg:pb-28">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-[#0037D2]/15 blur-3xl" />
            <div className="absolute right-[-100px] bottom-0 h-[380px] w-[380px] rounded-full bg-[#C1FF3B]/30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.11)}>
              <motion.a variants={fadeUp} href="/community"
                className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]/50 hover:text-[#0037D2]">
                ← Back to Community
              </motion.a>
              <motion.div variants={fadeUp}
                className="mb-8 flex w-fit items-center gap-2 rounded-full border border-[#111111]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0037D2]" />
                {testimonials.length} member{testimonials.length !== 1 ? "s" : ""} & counting
              </motion.div>

              <h1 className="text-balance text-[clamp(2.75rem,7vw,6rem)] font-black leading-[0.95] tracking-tight text-[#111111]">
                <WordReveal text="Real people." mode="nested" staggerDelay={0.06} />
                {" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#0037D2]"><WordReveal text="Real growth." mode="nested" staggerDelay={0.06} /></span>
                  <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-[#C1FF3B] md:h-6" />
                </span>
              </h1>

              <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg text-[#111111]/60 md:text-xl">
                Workshops, cohorts, mentorship, and 8,000+ founders growing together — in their own words.
              </motion.p>
            </motion.div>
          </div>
        </section>
        <SectionWave from="#F2ECDD" to="#0037D2" />

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
        <TestimonialEcosystem
          testimonials={testimonials}
          theme="community"
          emptyMessage="No community stories yet — add them in /admin/testimonials."
        />
        <SectionWave from="#F0EBD8" to="#0037D2" />

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section id="cta" className="bg-[#0037D2] py-24 text-white lg:py-32">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger(0.12)}
            className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">Ready to join them?</motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 text-balance text-4xl font-black tracking-tight md:text-6xl">Your story could be next.</motion.h2>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href="/apply" className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
                Join Community
              </a>
              <a href="/community" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                Explore Ecosystem
              </a>
            </motion.div>
          </motion.div>
        </section>
        <SectionWave from="#0037D2" to="var(--ink)" />

        <Footer siteSettings={siteSettings} />

      </main>
    </>
  );
}
