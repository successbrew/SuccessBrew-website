"use client";

import React from "react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { motion } from "framer-motion";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import type { Testimonial } from "@/components/ServicesPageClient";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { WordReveal } from "@/components/WordReveal";
import { TestimonialEcosystem } from "@/components/TestimonialEcosystem";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } },
};
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

interface Props { testimonials: Testimonial[]; siteSettings: SiteSettings }

export function TestimonialsPageClient({ testimonials, siteSettings }: Props) {
  return (
    <>
      <NavBar activePage="Services" ctaText="Book a Call" ctaHref="https://ntis.in/7oApLV" />
      <main className="bg-background font-sans text-ink">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-cream pt-32 pb-20 lg:pt-44 lg:pb-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute right-[-100px] bottom-0 h-[380px] w-[380px] rounded-full bg-accent/30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.11)}>
              <motion.div variants={fadeUp}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink/60 backdrop-blur">
                <span className="h-1.5 w-3 rounded-full bg-gradient-to-r from-primary to-accent" />
                {testimonials.length} founder{testimonials.length !== 1 ? "s" : ""} & counting
              </motion.div>

              {/* Kinetic typography */}
              <motion.h1
                initial="hidden" animate="visible" variants={stagger(0.07)}
                className="text-balance text-[clamp(2.8rem,7vw,6rem)] font-black leading-[0.95] tracking-tight text-ink">
                <WordReveal text="Real Founders." mode="nested" />
                {" "}
                <span className="relative inline-block">
                  <span className="relative z-10"><WordReveal text="Real Words." mode="nested" /></span>
                  <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-4 rounded-[2px] bg-gradient-to-r from-accent via-accent to-[#E4FFA8] md:h-5" />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg text-ink/60 md:text-xl">
                Unedited, unprompted, unsponsored. Every word below is from a founder who worked with us.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
        <TestimonialEcosystem
          testimonials={testimonials}
          theme="studio"
          emptyMessage="No testimonials yet — add them in the Studio."
        />

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-cream py-24 lg:py-32">
          <AmbientBackground tone="light" />
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger(0.12)}
            className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
            <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">Ready to join them?</motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 text-balance text-4xl font-black tracking-tight md:text-6xl">Your story could be next.</motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-lg text-lg text-ink/60">
              Book a 30-minute strategy call — no pitch, just clarity on what your next 90 days could look like.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="https://ntis.in/7oApLV" className="glow-blue inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#1F55E8] px-8 py-4 text-base font-bold text-white transition hover:translate-y-[-2px]">
                Book a Strategy Call
              </Link>
              <Link href="/#work" className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-background px-8 py-4 text-base font-semibold text-ink transition hover:bg-sand">
                See the work
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <Footer siteSettings={siteSettings} />

      </main>
    </>
  );
}
