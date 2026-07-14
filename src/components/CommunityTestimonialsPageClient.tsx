/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
"use client";

import React from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { ExpandableQuote } from "@/components/ExpandableQuote";
import { SocialLinks, type SiteSettings } from "@/components/SocialLinks";
import type { Testimonial } from "@/components/ServicesPageClient";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } } };
const cardUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

const cardBg: Record<string, string> = {
  sand: "bg-[#F0EBD8] text-[#111111]",
  dark: "bg-[#111111] text-white",
};
const avatarBg: Record<string, string> = {
  primary: "bg-[#0037D2] text-white",
  accent: "bg-[#C1FF3B] text-[#111111]",
};

function WordReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="inline-block overflow-hidden leading-[1.2]">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                visible: { y: "0%", opacity: 1, transition: { duration: 0.65, ease: E, delay: i * 0.06 } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

interface Props {
  testimonials: Testimonial[];
  siteSettings: SiteSettings;
}

export function CommunityTestimonialsPageClient({ testimonials, siteSettings }: Props) {
  return (
    <>
      <NavBar activePage="Community" ctaText="Join Community" ctaHref="/community#cta" />
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
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0037D2]" />
                {testimonials.length} member{testimonials.length !== 1 ? "s" : ""} & counting
              </motion.div>

              <h1 className="text-balance text-[clamp(2.75rem,7vw,6rem)] font-black leading-[0.95] tracking-tight text-[#111111]">
                <WordReveal text="Real people." />
                {" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#0037D2]"><WordReveal text="Real growth." /></span>
                  <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-[#C1FF3B] md:h-6" />
                </span>
              </h1>

              <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg text-[#111111]/60 md:text-xl">
                Workshops, cohorts, mentorship, and 8,000+ founders growing together — in their own words.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ══ GRID ══════════════════════════════════════════════════════ */}
        <section className="bg-[#F0EBD8] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.07)} className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {testimonials.map((t) => (
                <motion.figure key={t._id} variants={cardUp}
                  whileHover={{ y: -5, transition: { duration: 0.3, ease: E } }}
                  className={`mb-5 flex break-inside-avoid flex-col justify-between rounded-3xl border border-[#111111]/5 p-8 cursor-default ${cardBg[t.cardStyle] ?? cardBg.sand}`}>
                  <blockquote className="text-balance text-lg font-medium leading-snug">
                    <ExpandableQuote
                      quote={t.quote}
                      name={t.name}
                      role={t.role}
                      initial={t.initial}
                      avatarUrl={t.avatarUrl}
                      readMoreClassName={`mt-3 block text-sm font-semibold underline underline-offset-2 opacity-70 transition hover:opacity-100 ${t.cardStyle === "dark" ? "text-white" : ""}`}
                    />
                  </blockquote>
                  <figcaption className="mt-10 flex items-center gap-4">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.name} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold ${avatarBg[t.avatarStyle] ?? avatarBg.primary}`}>
                        {t.initial}
                      </span>
                    )}
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="mt-0.5 text-xs opacity-60">{t.role}</div>
                    </div>
                  </figcaption>
                </motion.figure>
              ))}
            </motion.div>

            {testimonials.length === 0 && (
              <p className="py-20 text-center text-[#111111]/40">No community stories yet — add them in /admin/testimonials.</p>
            )}
          </div>
        </section>

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
              <a href="/community#cta" className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
                Join Community
              </a>
              <a href="/community" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                Explore Ecosystem
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════ */}
        <footer className="bg-[#111111] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
            <div>
              <a href="/" className="mb-5 inline-block">
                <img src="/SB-logo.png" alt="Successbrew" className="h-10 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
              </a>
              <p className="mt-2 max-w-xs text-sm text-white/60">India&apos;s startup ecosystem — community, content studio, podcast, learning and events.</p>
              <SocialLinks settings={siteSettings} showLabel className="mt-6 text-white/70 hover:text-white" />
            </div>
            {([["Community", ["Members", "Events", "Podcast", "Learning Hub"]], ["Studio", ["Services", "Case Studies", "Process", "Testimonials"]], ["Company", ["About", "Careers", "Press", "Contact"]]] as [string, string[]][]).map(([title, items]) => (
              <div key={title}>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">{title}</div>
                <ul className="mt-5 space-y-3 text-sm">
                  {items.map(item => <li key={item}><a href="#" className="text-white/80 hover:text-[#C1FF3B]">{item}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between lg:px-10">
              <div>© 2026 Successbrew Studio. Building 1L entrepreneurs by 2030.</div>
              <div className="flex items-center gap-5">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
