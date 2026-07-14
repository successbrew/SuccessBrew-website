/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import type { Testimonial } from "@/components/ServicesPageClient";
import { SocialLinks, type SiteSettings } from "@/components/SocialLinks";
import { ExpandableQuote } from "@/components/ExpandableQuote";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } },
};
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

const cardBg: Record<string, string> = {
  sand: "bg-sand text-ink",
  dark: "bg-ink text-background",
};
const avatarBg: Record<string, string> = {
  primary: "bg-primary text-white",
  accent:  "bg-accent text-ink",
};
const quoteColor: Record<string, string> = {
  sand: "text-primary/15",
  dark: "text-white/10",
};

// Kinetic word reveal
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

interface Props { testimonials: Testimonial[]; siteSettings: SiteSettings }

export function TestimonialsPageClient({ testimonials, siteSettings }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const rest = testimonials.slice(1);

  // Auto-cycle featured testimonial every 5s — paused while its "Read more" dialog is open
  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, [testimonials.length, isPaused]);

  const featured = testimonials[activeIdx];

  return (
    <>
      <NavBar activePage="Services" ctaText="Book a Call" ctaHref="/#cta" />
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
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/60 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {testimonials.length} founder{testimonials.length !== 1 ? "s" : ""} & counting
              </motion.div>

              {/* Kinetic typography */}
              <motion.h1
                initial="hidden" animate="visible" variants={stagger(0.07)}
                className="text-balance text-[clamp(2.8rem,7vw,6rem)] font-black leading-[0.95] tracking-tight text-ink">
                <WordReveal text="Real Founders." />
                {" "}
                <span className="relative inline-block">
                  <span className="relative z-10"><WordReveal text="Real Words." /></span>
                  <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-accent md:h-5" />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg text-ink/60 md:text-xl">
                Unedited, unprompted, unsponsored. Every word below is from a founder who worked with us.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ══ AUTO-CYCLING FEATURED TESTIMONIAL ════════════════════════ */}
        {testimonials.length > 0 && (
          <section className="relative bg-primary py-20 lg:py-28 overflow-hidden">
            <div className="mx-auto max-w-5xl px-6 lg:px-10">
              <div aria-hidden className="mb-6 font-serif text-[8rem] leading-none text-white/10 select-none">&quot;</div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.55, ease: E }}
                >
                  <blockquote className="text-balance text-[clamp(1.6rem,3.5vw,2.8rem)] font-bold leading-[1.25] tracking-tight text-white">
                    {featured && (
                      <ExpandableQuote
                        quote={featured.quote}
                        name={featured.name}
                        role={featured.role}
                        initial={featured.initial}
                        readMoreClassName="mt-4 block text-base font-semibold text-white/70 underline underline-offset-2 transition hover:text-white"
                        onOpenChange={setIsPaused}
                        withQuoteMarks={false}
                      />
                    )}
                  </blockquote>
                  <figcaption className="mt-10 flex items-center gap-4">
                    <span className={`grid h-14 w-14 place-items-center rounded-full text-base font-bold ${avatarBg[featured?.avatarStyle ?? "primary"] ?? avatarBg.primary}`}>
                      {featured?.initial}
                    </span>
                    <div>
                      <div className="text-base font-semibold text-white">{featured?.name}</div>
                      <div className="text-sm text-white/60">{featured?.role}</div>
                    </div>
                  </figcaption>
                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              {testimonials.length > 1 && (
                <div className="mt-10 flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ width: i === activeIdx ? 28 : 8, background: i === activeIdx ? "#C1FF3B" : "rgba(255,255,255,0.25)" }}
                      aria-label={`View testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══ MASONRY GRID ══════════════════════════════════════════════ */}
        <section className="bg-background py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div
              initial="hidden" whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.07)}
              className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {rest.map((t, i) => (
                <motion.figure
                  key={t._id}
                  variants={{
                    hidden: { opacity: 0, y: 22, scale: 0.97 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: E } },
                  }}
                  whileHover={{ y: -5, transition: { duration: 0.28, ease: E } }}
                  className={`relative mb-5 break-inside-avoid overflow-hidden rounded-3xl border border-ink/5 p-8 md:p-9 cursor-default ${cardBg[t.cardStyle] ?? cardBg.sand}`}>

                  <div aria-hidden className={`absolute right-6 top-4 font-serif text-7xl leading-none select-none ${quoteColor[t.cardStyle] ?? "text-ink/10"}`}>&quot;</div>

                  <blockquote className="relative text-balance text-lg font-medium leading-snug">
                    <ExpandableQuote
                      quote={t.quote}
                      name={t.name}
                      role={t.role}
                      initial={t.initial}
                      avatarUrl={t.avatarUrl}
                      readMoreClassName={`mt-3 block text-sm font-semibold underline underline-offset-2 opacity-70 transition hover:opacity-100 ${t.cardStyle === "dark" ? "text-white" : ""}`}
                    />
                  </blockquote>

                  <figcaption className="mt-8 flex items-center gap-3">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${avatarBg[t.avatarStyle] ?? avatarBg.primary}`}>
                        {t.initial}
                      </span>
                    )}
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className={`text-xs ${t.cardStyle === "dark" ? "opacity-50" : "text-ink/50"}`}>{t.role}</div>
                    </div>
                  </figcaption>

                  <div aria-hidden className={`mt-6 text-[10px] font-bold uppercase tracking-[0.2em] ${t.cardStyle === "dark" ? "text-white/20" : "text-ink/20"}`}>
                    #{String(i + 2).padStart(2, "0")}
                  </div>
                </motion.figure>
              ))}
            </motion.div>

            {rest.length === 0 && !testimonials.length && (
              <p className="py-20 text-center text-ink/40">No testimonials yet — add them in the Studio.</p>
            )}
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section className="bg-cream py-24 lg:py-32">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger(0.12)}
            className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Ready to join them?</motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 text-balance text-4xl font-black tracking-tight md:text-6xl">Your story could be next.</motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-lg text-lg text-ink/60">
              Book a 30-minute strategy call — no pitch, just clarity on what your next 90 days could look like.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/#cta" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-[0_10px_40px_-10px_oklch(0.45_0.22_264_/_0.55)] transition hover:translate-y-[-2px]">
                Book a Strategy Call
              </Link>
              <Link href="/#work" className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-background px-8 py-4 text-base font-semibold text-ink transition hover:bg-sand">
                See the work
              </Link>
            </motion.div>
          </motion.div>
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
                  {items.map(item => (
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
