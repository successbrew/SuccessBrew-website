/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import type { CaseStudy } from "@/components/ServicesPageClient";
import { SocialLinks, type SiteSettings } from "@/components/SocialLinks";

export type { CaseStudy };

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } },
};
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

// Kinetic word reveal (same as ServicesPageClient)
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
                visible: { y: "0%", opacity: 1, transition: { duration: 0.65, ease: E, delay: i * 0.07 } },
              }}>
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

export function CaseStudiesPageClient({
  caseStudies,
  siteSettings,
  initialSelectedId,
}: {
  caseStudies: CaseStudy[];
  siteSettings: SiteSettings;
  initialSelectedId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialSelectedId && caseStudies.some((cs) => cs._id === initialSelectedId)
      ? initialSelectedId
      : caseStudies[0]?._id
  );
  const selected = caseStudies.find((cs) => cs._id === selectedId) ?? caseStudies[0];

  return (
    <>
      <NavBar activePage="Services" ctaText="Book a Call" ctaHref="#cta" />
      <main className="bg-background font-sans text-ink">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-ink pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 top-10 h-[400px] w-[400px] rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute right-[-100px] bottom-0 h-[350px] w-[350px] rounded-full bg-accent/20 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.12)}>
              <motion.div variants={fadeUp}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Selected Work
              </motion.div>

              {/* Kinetic typography */}
              <motion.h1
                initial="hidden" animate="visible" variants={stagger(0.06)}
                className="max-w-3xl text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tight text-white">
                <WordReveal text="Results that" />
                {" "}
                <span className="relative inline-block">
                  <span className="relative z-10">
                    <WordReveal text="compound." />
                  </span>
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-accent md:h-5" />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-white/50">
                Real brands. Real numbers. Here&apos;s how we&apos;ve helped founders build lasting visibility.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ══ CASE STUDIES — list + PDF viewer ══════════════════════════ */}
        <section className="bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            {caseStudies.length === 0 ? (
              <div className="py-32 text-center text-ink/30">
                <p className="text-lg font-semibold">No case studies yet.</p>
                <p className="mt-1 text-sm">Add them in the admin at /admin/case-studies</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:h-[78vh] lg:grid-cols-[360px_1fr]">
                {/* List */}
                <div className="overflow-y-auto rounded-3xl border border-ink/5 bg-sand/40 lg:h-full">
                  {caseStudies.map((cs) => {
                    const isActive = cs._id === selected?._id;
                    return (
                      <button
                        key={cs._id}
                        type="button"
                        onClick={() => setSelectedId(cs._id)}
                        className={`flex w-full items-center gap-4 border-b border-ink/5 p-5 text-left transition last:border-b-0 ${
                          isActive ? "border-l-4 border-l-primary bg-primary/8" : "border-l-4 border-l-transparent hover:bg-background"
                        }`}
                      >
                        <img
                          src={cs.imageUrl ?? "/grid-images/service-page.jpg"}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{cs.tag}</span>
                          <p className="truncate text-sm font-bold text-ink">{cs.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* PDF viewer */}
                <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-ink/5 bg-sand/20 lg:h-full">
                  {selected?.pdfUrl ? (
                    <>
                      <iframe
                        key={selected._id}
                        src={selected.pdfUrl}
                        title={selected.title}
                        className="hidden h-full w-full lg:block"
                      />
                      <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center lg:hidden">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                          {selected.tag}
                        </span>
                        <p className="text-lg font-black tracking-tight text-ink">{selected.title}</p>
                        <a
                          href={selected.pdfUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                        >
                          Open PDF
                        </a>
                      </div>
                      <a
                        href={selected.pdfUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="absolute right-4 top-4 hidden items-center gap-1.5 rounded-full bg-background/90 px-4 py-2 text-xs font-semibold text-ink shadow-md backdrop-blur lg:inline-flex"
                      >
                        Open in new tab ↗
                      </a>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
                      <p className="font-semibold text-ink/50">PDF coming soon</p>
                      <p className="text-sm text-ink/30">This case study doesn&apos;t have a PDF attached yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section className="bg-primary py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger(0.12)}>
              <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">
                Let&apos;s work together
              </motion.p>
              <motion.h2 variants={fadeUp} className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                Ready to be the next case study?
              </motion.h2>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/#cta"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-ink shadow-[0_10px_40px_-10px_rgba(193,255,59,0.5)] transition hover:translate-y-[-2px]">
                  Book a Strategy Call
                </Link>
                <Link href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                  View Our Services
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════ */}
        <footer className="bg-ink text-background">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
            <div>
              <Link href="/" className="mb-5 inline-block">
                <img src="/SB-logo.png" alt="Successbrew" className="h-10 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
              </Link>
              <p className="mt-2 max-w-xs text-sm text-background/60">India&apos;s startup ecosystem — community, content studio, podcast, learning and events.</p>
              <SocialLinks settings={siteSettings} showLabel className="mt-6 text-background/70 hover:text-background" />
            </div>
            {([["Studio", ["Services", "Case Studies", "Process", "Testimonials"]], ["Ecosystem", ["Community", "Events", "Podcast", "Learning"]], ["Company", ["About", "Careers", "Press", "Contact"]]] as [string, string[]][]).map(([title, items]) => (
              <div key={title}>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-background/50">{title}</div>
                <ul className="mt-5 space-y-3 text-sm">
                  {items.map((item) => (
                    <li key={item}><a href="#" className="text-background/80 transition hover:text-accent">{item}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-background/10">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-background/50 md:flex-row md:items-center md:justify-between lg:px-10">
              <div>© 2026 Successbrew Studio. Building 1L entrepreneurs by 2030.</div>
              <div className="flex items-center gap-5">
                <a href="#" className="hover:text-background">Privacy</a>
                <a href="#" className="hover:text-background">Terms</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
