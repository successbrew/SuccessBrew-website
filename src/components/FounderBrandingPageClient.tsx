"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import type { SiteSettings } from "@/components/SocialLinks";
import type { BrandPartner } from "@/components/LogoShowcase";
import type { CaseStudy, Testimonial } from "@/components/ServicesPageClient";
import { ExpandableQuote, extractMainLine } from "@/components/ExpandableQuote";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { Arrow, E, Glow, GradientBorder, GradientText, Mark, Reveal, SectionLabel, fadeUp, headlineMetric, pickFounderCaseStudies, stagger } from "@/components/LandingPrimitives";
import {
  AUDIO_TESTIMONIALS,
  BOOKING_URL,
  CAPABILITIES,
  ECOSYSTEMS,
  FOUNDER_STATS,
  ONE_DAY_FLOW,
  PROOF_STATS,
  SYSTEM_STAGES,
  VIDEO_TESTIMONIALS,
} from "@/lib/content/founder-branding";

/* ──────────────────────────────────────────────────────────────────────────
 * Founder Personal Branding landing page.
 * Pattern: Trust & Authority + Conversion — hero → proof → belief → system →
 * offer → proof of work → voices → founder → one clear CTA. Dark theme for
 * authority; blue→lime gradients (glows, underlines, rails, numbers) carry the
 * brand colour — blue is never used as text on black.
 * ────────────────────────────────────────────────────────────────────────── */

function PrimaryCta({ children = "Build My Personal Brand", tone = "blue", className = "" }: { children?: React.ReactNode; tone?: "blue" | "lime"; className?: string }) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex h-12 items-center justify-center gap-2 rounded-[6px] px-6 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        tone === "lime"
          ? "bg-accent text-ink shadow-[0_10px_30px_-10px_rgba(198,255,58,0.55)] hover:bg-white focus-visible:ring-white focus-visible:ring-offset-ink"
          : "bg-gradient-to-r from-primary to-[#1F55E8] text-white shadow-[0_10px_30px_-10px_rgba(0,60,209,0.8)] hover:from-white hover:to-white hover:text-ink focus-visible:ring-accent focus-visible:ring-offset-ink"
      } ${className}`}
    >
      {children}
      <Arrow className="transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

export function FounderBrandingPageClient({
  caseStudies,
  testimonials,
  brandPartners,
  siteSettings,
}: {
  caseStudies: CaseStudy[];
  testimonials: Testimonial[];
  brandPartners: BrandPartner[];
  siteSettings: SiteSettings;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const finalRef = useRef<HTMLElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // Mobile sticky CTA: appears once the hero's own CTA has scrolled away and
  // gets out of the way when the final CTA section is on screen.
  useEffect(() => {
    const hero = heroRef.current;
    const final = finalRef.current;
    if (!hero || !final) return;
    let heroVisible = true;
    let finalVisible = false;
    const update = () => setShowStickyCta(!heroVisible && !finalVisible);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) heroVisible = e.isIntersecting;
        if (e.target === final) finalVisible = e.isIntersecting;
      }
      update();
    });
    io.observe(hero);
    io.observe(final);
    return () => io.disconnect();
  }, []);

  const stories = pickFounderCaseStudies(caseStudies);
  const people = testimonials.slice(0, 9);
  const written = testimonials.filter((t) => t.quote.length >= 120).slice(0, 3);

  return (
    <MotionConfig reducedMotion="user">
      <NavBar variant="dark" activePage="Services" ctaText="Build My Personal Brand" ctaHref={BOOKING_URL} />
      <main className="bg-ink pb-20 font-sans text-white md:pb-0">

        {/* ══ 01 HERO ════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="relative overflow-hidden bg-[#0B0B0B] pt-28 pb-20 lg:pt-36 lg:pb-28">
          <Glow variant="hero" grid />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}>
              <motion.nav variants={fadeUp} aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.1em] text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <Link href="/#services" className="underline-offset-4 transition-colors hover:text-white hover:underline">Services</Link>
                <span aria-hidden="true">/</span>
                <span className="text-white" aria-current="page">Founder Led Growth</span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span className="text-white/70">Personal Branding</span>
              </motion.nav>
              <motion.h1 variants={fadeUp} className="mt-6 text-balance text-[clamp(2.5rem,5.6vw,5rem)] font-black leading-[0.98] tracking-tight">
                How you <Mark>position</Mark> yourself is how the world sees you.
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-balance text-xl leading-snug text-white/75 md:text-2xl">
                We turn founder expertise into <span className="font-semibold text-white">authority</span>,{" "}
                <span className="font-semibold text-white">visibility</span> and{" "}
                <GradientText className="font-semibold">opportunity</GradientText>.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 max-w-xl space-y-4 text-[17px] text-white/55">
                <p>
                  Your business may be doing remarkable things. Your experience may be worth listening to. Your ideas may be
                  ahead of your industry.
                </p>
                <p>But if your digital presence doesn&rsquo;t communicate that clearly, the market can&rsquo;t see it.</p>
                <p className="text-white/90">
                  Successbrew helps founders and leaders build the positioning, content and online presence that makes their
                  expertise impossible to overlook.
                </p>
              </motion.div>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-3">
                <PrimaryCta />
                <a href="#work" className="inline-flex h-12 items-center gap-2 rounded-[6px] border border-white/15 px-5 text-[15px] font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5">
                  See Our Work <span aria-hidden="true">↓</span>
                </a>
              </motion.div>
            </motion.div>

            {/* Founder photo + the founder → opportunity journey */}
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9, ease: E }}
              className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-ink sm:aspect-[5/4] lg:aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/founder-branding/founder-on-stage.jpg" alt="Sourabh Goyal speaking to a room of founders"
                  className="h-full w-full object-cover object-[60%_center]" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              </div>
              <GradientBorder className="relative -mt-24 ml-auto w-[min(100%,300px)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] sm:-mt-32 lg:absolute lg:-left-10 lg:bottom-8 lg:mt-0 lg:ml-0"
                innerClassName="bg-[#141414]/95 p-5 backdrop-blur">
              <ol aria-label="How expertise becomes opportunity">
                {["Founder", "Ideas", "Content", "Audience", "Authority", "Opportunities"].map((step, i, arr) => {
                  const isLast = i === arr.length - 1;
                  return (
                    <motion.li key={step} className="relative flex items-center gap-3 py-1.5"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.12, duration: 0.5, ease: E }}>
                      {!isLast && <span aria-hidden="true" className="absolute left-[9px] top-[26px] h-[calc(100%-14px)] w-px bg-gradient-to-b from-primary to-primary/40" style={{ opacity: 0.5 + i * 0.1 }} />}
                      <span className={`relative z-10 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${isLast ? "bg-accent text-ink" : "bg-primary text-white"}`}>
                        {i + 1}
                      </span>
                      <span className={`text-sm ${isLast ? "font-semibold text-accent" : "text-white/70"}`}>{step}</span>
                    </motion.li>
                  );
                })}
              </ol>
              </GradientBorder>
            </motion.div>
          </div>
        </section>

        {/* ══ 02 THE VISIBILITY GAP ═════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] bg-ink py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="02" text="The visibility gap" tone="dark" />
              <h2 className="mt-5 max-w-4xl text-balance text-[clamp(2.25rem,4.6vw,4rem)] font-black leading-[1.02] tracking-tight">
                You&rsquo;re already an expert.<br />
                <span className="text-white/35">You just don&rsquo;t look like one online.</span>
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
              <Reveal className="rounded-xl bg-gradient-to-br from-primary/25 via-white/[0.03] to-transparent p-8 ring-1 ring-inset ring-white/10 md:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">What you&rsquo;ve built</p>
                <ul className="mt-8 space-y-6">
                  {[
                    "A company worth talking about",
                    "Opinions your industry needs to hear",
                    "Stories that inspire customers, employees and investors",
                  ].map((item) => (
                    <li key={item} className="flex gap-4 text-lg font-semibold leading-snug md:text-xl">
                      <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-white">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* The gap itself */}
              <div className="flex items-center justify-center lg:px-8" aria-hidden="true">
                <div className="flex w-full items-center gap-3 lg:h-full lg:w-auto lg:flex-col">
                  <span className="h-px flex-1 bg-gradient-to-r from-primary to-accent lg:h-auto lg:w-[2px] lg:flex-1 lg:bg-gradient-to-b" />
                  <span className="rounded-full border border-accent/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">The gap</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-accent to-white/10 lg:h-auto lg:w-[2px] lg:flex-1 lg:bg-gradient-to-b" />
                </div>
              </div>

              <Reveal delay={0.15} className="rounded-xl border border-dashed border-white/15 p-8 md:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">What the internet sees</p>
                <ul className="mt-8 space-y-6" aria-label="A thin, unclear online presence">
                  {["An inactive profile", "Scattered, occasional posts", "No clear point of view"].map((item, i) => (
                    <li key={item} className="flex gap-4">
                      <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-dashed border-white/25 text-[11px] font-semibold text-white/35">?</span>
                      <span className="flex-1">
                        <span className="block text-lg leading-snug text-white/35 md:text-xl">{item}</span>
                        <span aria-hidden="true" className="mt-2 block h-2 rounded-full bg-white/[0.06]" style={{ width: `${70 - i * 15}%` }} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal className="mt-14 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-2xl text-lg text-white/55">
                You have built a company worth talking about — but your digital presence may not reflect the person you&rsquo;ve become.
              </p>
              <p className="text-2xl font-black tracking-tight md:text-3xl">
                That&rsquo;s the gap <Mark>we solve.</Mark>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ══ 03 WHO TRUSTS US ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#0B0B0B] py-24 lg:py-32">
          <Glow variant="corner" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="03" text="Who trusts us" tone="dark" />
              <h2 className="mt-5 max-w-4xl text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                We&rsquo;ve helped founders become visible for what they&rsquo;re actually good at.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="mt-12 grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {PROOF_STATS.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse py-6 sm:px-8 sm:first:pl-0">
                    <dt className="mt-2 max-w-[16rem] text-sm leading-snug text-white/55">{s.label}</dt>
                    <dd className="text-5xl font-black tracking-tight md:text-6xl"><GradientText>{s.value}</GradientText></dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {/* The people wall — who we've worked with */}
            {people.length > 0 && (
              <motion.ul initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.05)}
                className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                {people.map((p) => (
                  <motion.li key={p._id} variants={fadeUp}
                    className="group flex items-start gap-4 bg-[#0D0D0D] p-6 transition-colors duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-[#0A2A8F]">
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover grayscale" />
                    ) : (
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[#1F55E8] text-base font-semibold text-white transition-colors group-hover:from-accent group-hover:to-accent group-hover:text-ink">
                        {p.initial}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block font-semibold text-white">{p.name}</span>
                      <span title={p.role} className="mt-1 line-clamp-2 text-sm leading-snug text-white/50 transition-colors group-hover:text-white/80">
                        {p.role}
                      </span>
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {brandPartners.length > 0 && (
              <Reveal className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">And the brands behind them</p>
                {/* Logos are a mix of transparent PNGs and JPGs on white, so each sits on its own light tile */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {brandPartners.filter((b) => b.logoUrl).slice(0, 10).map((b) => (
                    <span key={b._id} className="grid h-14 place-items-center rounded-[6px] bg-white/[0.92] px-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.logoUrl} alt={b.name} loading="lazy"
                        className="h-6 w-auto max-w-[110px] object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0" />
                    </span>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {/* ══ 04 OUR BELIEF ═════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-white/[0.06] bg-ink py-24 text-white lg:py-36">
          <Glow variant="center" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="04" text="Our belief" tone="dark" />
              <p className="mt-8 text-balance text-2xl text-white/55 md:text-3xl">Personal branding isn&rsquo;t about becoming famous.</p>
              <h2 className="mt-4 max-w-5xl text-balance text-[clamp(2.75rem,7vw,6.5rem)] font-black leading-[0.95] tracking-tight">
                It&rsquo;s about becoming{" "}
                {/* Highlighter bar that follows the text across line breaks */}
                <Mark>known for something.</Mark>
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
              <Reveal>
                <ul className="space-y-4 text-lg text-white/45 md:text-xl">
                  {["You don’t need more random posts.", "You don’t need to chase every trend.", "You don’t need to become a full-time content creator."].map((l) => (
                    <li key={l} className="border-b border-white/10 pb-4">{l}</li>
                  ))}
                </ul>
                <p className="mt-8 text-balance text-xl leading-snug md:text-2xl">
                  You need a clear point of view, a recognisable narrative and consistent visibility around the things you
                  want to be known for.
                </p>
              </Reveal>

              <Reveal delay={0.15} className="self-end">
                <ol className="flex flex-col gap-3" aria-label="From fame to opportunity">
                  {[
                    { label: "Fame", note: "Not the goal", style: "text-white/30 line-through decoration-white/40" },
                    { label: "Recognition", note: "People know what you stand for", style: "text-white" },
                    { label: "Authority", note: "People trust your point of view", style: "text-white" },
                    { label: "Opportunity", note: "Trust turns into inbound", style: "bg-gradient-to-r from-white to-accent bg-clip-text text-transparent" },
                  ].map((s, i) => (
                    <li key={s.label} className="flex items-baseline justify-between gap-6 border-b border-white/10 pb-3">
                      <span className="flex items-baseline gap-4">
                        <span className="text-xs text-white/35">0{i + 1}</span>
                        <span className={`text-3xl font-black tracking-tight md:text-4xl ${s.style}`}>{s.label}</span>
                      </span>
                      <span className="text-right text-xs text-white/45">{s.note}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ 05 THE PERSONAL BRAND SYSTEM ══════════════════════════════ */}
        <section id="system" className="scroll-mt-24 bg-[#0B0B0B] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <div>
                <SectionLabel n="05" text="The Successbrew personal brand system" tone="dark" />
                <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.6vw,4rem)] font-black leading-[1.02] tracking-tight">
                  We don&rsquo;t start with content.<br />
                  <Mark>We start with positioning.</Mark>
                </h2>
              </div>
              <p className="max-w-md text-lg text-white/55 lg:justify-self-end">
                Five connected stages — each one built on the last, so every post, video and appearance points in the same direction.
              </p>
            </Reveal>

            <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.12)}
              className="relative mt-16 grid gap-10 lg:grid-cols-5 lg:gap-6">
              {/* Connecting rail */}
              <span aria-hidden="true" className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-primary/70 to-accent lg:bg-gradient-to-r lg:left-0 lg:right-0 lg:top-5 lg:bottom-auto lg:h-px lg:w-auto" />
              {SYSTEM_STAGES.map((s, i) => {
                const isLast = i === SYSTEM_STAGES.length - 1;
                return (
                  <motion.li key={s.key} variants={fadeUp} className="relative pl-14 lg:pl-0">
                    <span className={`absolute left-0 top-0 z-10 grid h-10 w-10 place-items-center rounded-full text-sm font-semibold lg:relative
                      ${isLast ? "bg-accent text-ink ring-4 ring-[#0B0B0B]" : "bg-primary text-white ring-4 ring-[#0B0B0B]"}`}>
                      0{i + 1}
                    </span>
                    <h3 className={`text-2xl font-black uppercase tracking-tight lg:mt-6 ${isLast ? "text-accent" : "text-white"}`}>{s.key}</h3>
                    <p className="mt-2 text-[17px] font-semibold leading-snug text-white/90">{s.question}</p>
                    <p className="mt-3 text-sm text-white/50">{s.detail}</p>
                    {isLast && (
                      <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
                        → Opportunity
                      </p>
                    )}
                  </motion.li>
                );
              })}
            </motion.ol>
          </div>
        </section>

        {/* ══ 06 WHAT WE ACTUALLY DO ════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] bg-ink py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10">
            <Reveal>
              <SectionLabel n="06" text="What we actually do" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                Three things. <GradientText>Done properly.</GradientText>
              </h2>
              <p className="mt-6 max-w-sm text-lg text-white/55">
                No long menu of services. Just the work that makes a founder visible, every month.
              </p>
            </Reveal>

            <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="border-t border-white/10">
              {CAPABILITIES.map((c, i) => (
                <motion.li key={c.title} variants={fadeUp}
                  className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-white/10 py-8 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:items-baseline">
                  <span className="text-sm text-white/35">0{i + 1}</span>
                  <h3 className="text-2xl font-black tracking-tight md:text-3xl">{c.title}</h3>
                  <p className="col-start-2 mt-2 text-[17px] text-white/55 sm:col-start-3 sm:mt-0">{c.desc}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* ══ 07 THE ONE-DAY-A-MONTH MODEL ══════════════════════════════ */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#003CD1_0%,#002A93_55%,#0B1640_100%)] py-24 text-white lg:py-32">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-accent/25 blur-[130px]" />
          <div className="relative mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-10">
            <Reveal>
              <SectionLabel n="07" text="The one-day-a-month model" tone="dark" />
              <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                One day / month
              </span>
              <h2 className="mt-6 text-balance text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-[0.98] tracking-tight">
                You build the business.<br />We&rsquo;ll build the visibility.
              </h2>
              <p className="mt-6 max-w-lg text-lg text-white/75">
                You don&rsquo;t need to spend every day creating content. We structure the process around your time.
              </p>
              <p className="mt-4 max-w-lg text-lg text-white">
                One focused day with the founder can become an entire month&rsquo;s worth of strategic content and visibility.
              </p>
              <div className="mt-10">
                <PrimaryCta tone="lime">See How It Works</PrimaryCta>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="rounded-xl border border-white/15 bg-[#0B1640]/40 p-6 backdrop-blur md:p-8">
                <div className="flex items-end justify-between gap-3 border-b border-white/15 pb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">Your time</p>
                    <p className="mt-1 whitespace-nowrap text-4xl font-black tracking-tight sm:text-5xl">1 day</p>
                  </div>
                  <Arrow className="mb-3 h-6 w-6 text-accent" />
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">Your visibility</p>
                    <p className="mt-1 whitespace-nowrap text-4xl font-black tracking-tight sm:text-5xl"><GradientText>1 month</GradientText></p>
                  </div>
                </div>
                <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger(0.08)} className="mt-6 grid gap-2 sm:grid-cols-2">
                  {ONE_DAY_FLOW.map((step, i) => {
                    const isKey = /short-form/i.test(step);
                    return (
                      <motion.li key={step} variants={fadeUp}
                        className={`flex items-center gap-3 rounded-[6px] px-4 py-3 text-[15px] ${isKey ? "bg-accent font-semibold text-ink" : "bg-white/[0.07] text-white/90"}`}>
                        <span className={`text-xs ${isKey ? "text-ink/60" : "text-white/45"}`}>{String(i + 1).padStart(2, "0")}</span>
                        {step}
                      </motion.li>
                    );
                  })}
                </motion.ol>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ 08 CASE STUDIES ═══════════════════════════════════════════ */}
        <section id="work" className="relative scroll-mt-24 overflow-hidden bg-[#0B0B0B] py-24 lg:py-32">
          <Glow variant="corner" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <SectionLabel n="08" text="Case studies" tone="dark" />
                <h2 className="mt-5 max-w-3xl text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                  What happens when expertise meets visibility?
                </h2>
              </div>
              <Link href="/case-studies" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline">
                All case studies <Arrow />
              </Link>
            </Reveal>

            <div className="mt-16 space-y-20 lg:space-y-28">
              {stories.map((c, idx) => {
                const metric = headlineMetric(c);
                const stages = [
                  { label: "Before", text: c.problem },
                  { label: "Positioning", text: c.strategy },
                  { label: "Execution", text: c.solutionContent },
                  { label: "After", text: c.results },
                ].filter((s): s is { label: string; text: string } => Boolean(s.text?.trim()));
                return (
                  <Reveal key={c._id}>
                    <article className={`grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16 ${idx % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                      {/* Case study covers are 16:9 graphics with text on them — show them whole */}
                      <Link href={`/case-studies/${c._id}`} tabIndex={-1} aria-hidden="true"
                        className="block overflow-hidden rounded-xl border border-white/10 bg-white/5 lg:sticky lg:top-28">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.imageUrl ?? ""} alt="" loading="lazy"
                          className="aspect-video w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
                      </Link>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">{c.tag.trim()}</p>
                        <h3 className="mt-3 text-balance text-2xl font-black leading-tight tracking-tight md:text-3xl">{c.title}</h3>
                        {metric && (
                          <p className="mt-5 flex items-baseline gap-3">
                            <span className="text-4xl font-black leading-none tracking-tight md:text-5xl"><GradientText>{metric.value}</GradientText></span>
                            <span className="text-sm text-white/55">{metric.label}</span>
                          </p>
                        )}
                        <ol className="mt-8 space-y-5 border-l border-transparent pl-6 [border-image:linear-gradient(to_bottom,var(--color-primary),var(--color-accent))_1]">
                          {stages.map((s, i) => (
                            <li key={s.label} className="relative">
                              <span aria-hidden="true" className={`absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full ${i === stages.length - 1 ? "bg-accent" : "bg-primary"}`} />
                              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">{s.label}</p>
                              <p className={`mt-1 text-[15px] ${i === stages.length - 1 ? "font-semibold text-white" : "text-white/60"}`}>{extractMainLine(s.text, 190)}</p>
                            </li>
                          ))}
                        </ol>
                        <Link href={`/case-studies/${c._id}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline">
                          Read the full story <Arrow />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ 09 TESTIMONIALS ═══════════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] bg-ink py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="09" text="Testimonials" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                Don&rsquo;t take our word for it.
              </h2>
              <p className="mt-4 text-lg text-white/55">Hear it from the people we&rsquo;ve built with.</p>
            </Reveal>

            {VIDEO_TESTIMONIALS.length > 0 && (
              <div className="-mx-6 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                {VIDEO_TESTIMONIALS.map((v) => (
                  <figure key={v.youtubeId} className="w-[85%] shrink-0 snap-start md:w-auto">
                    <YouTubeEmbed videoId={v.youtubeId} title={`${v.name} on working with Successbrew`} className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black" />
                    <figcaption className="mt-4">
                      <p className="text-[17px] font-semibold leading-snug">&ldquo;{v.takeaway}&rdquo;</p>
                      <p className="mt-2 text-sm text-white/50">{v.name} · {v.designation}, {v.company}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {AUDIO_TESTIMONIALS.length > 0 && (
              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {AUDIO_TESTIMONIALS.map((a) => <AudioTestimonial key={a.audioUrl} {...a} />)}
              </div>
            )}

            {written.length > 0 && (
              <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                {written.map((t, i) => (
                  <Reveal key={t._id} delay={i * 0.08}
                    className={`flex min-w-0 flex-col rounded-xl border p-8 md:p-10 ${i === 0 ? "relative overflow-hidden border-primary bg-[linear-gradient(150deg,#003CD1_0%,#0030A8_60%,#0B1640_100%)] text-white lg:row-span-2" : "border-white/10 bg-white/[0.03]"}`}>
                    <svg className={`h-7 w-7 shrink-0 ${i === 0 ? "text-accent" : "text-white/40"}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M9.5 6C6.5 7.2 4.5 9.8 4.5 13v5h6v-6H7.6c.2-2 1.4-3.5 3.3-4.3L9.5 6zm9 0c-3 1.2-5 3.8-5 7v5h6v-6h-2.9c.2-2 1.4-3.5 3.3-4.3L18.5 6z" />
                    </svg>
                    <blockquote className={`mt-6 flex-1 font-medium ${i === 0 ? "text-2xl leading-snug md:text-[1.75rem]" : "text-lg leading-snug"}`}>
                      <ExpandableQuote quote={t.quote} name={t.name} role={t.role} initial={t.initial} avatarUrl={t.avatarUrl}
                        previewLength={i === 0 ? 560 : 180} withQuoteMarks={false}
                        readMoreClassName={`mt-3 block text-sm font-semibold underline underline-offset-2 ${i === 0 ? "text-white/80 hover:text-white" : "text-white/60 hover:text-white"}`} />
                    </blockquote>
                    <figcaption className={`mt-8 flex items-center gap-3 border-t pt-5 ${i === 0 ? "border-white/20" : "border-white/10"}`}>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${i === 0 ? "bg-white text-primary" : "bg-primary text-white"}`}>{t.initial}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{t.name}</span>
                        <span title={t.role} className={`line-clamp-2 text-xs leading-snug ${i === 0 ? "text-white/70" : "text-white/50"}`}>{t.role}</span>
                      </span>
                    </figcaption>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══ 10 FOUNDER AUTHORITY ══════════════════════════════════════ */}
        <section className="bg-[#0B0B0B] py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:px-10">
            <Reveal className="relative">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/founder-branding/sourabh-portrait.jpg" alt="Sourabh Goyal, Founder of Successbrew" loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
              </div>
              <div className="absolute -bottom-5 left-5 right-5 rounded-[6px] bg-gradient-to-r from-primary to-[#0A2A8F] px-5 py-4 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] sm:left-auto sm:right-6 sm:w-64">
                <p className="font-semibold text-white">Sourabh Goyal</p>
                <p className="text-sm text-white/75">Founder, Successbrew</p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <SectionLabel n="10" text="Founder authority" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2rem,3.8vw,3.25rem)] font-black leading-[1.05] tracking-tight">
                Built by someone who has spent years in the founder ecosystem.
              </h2>
              <p className="mt-6 text-lg text-white/60">
                From building communities and founder networks to helping leaders become visible online, Sourabh has spent
                years at the intersection of content, personal branding, community and entrepreneurship.
              </p>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.1em] text-white/40">Spoken at &amp; worked with</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {ECOSYSTEMS.map((e) => (
                  <li key={e} className="rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/75">{e}</li>
                ))}
              </ul>

              <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
                {FOUNDER_STATS.map((s) => (
                  <div key={s.label} className="bg-[#0B0B0B] p-5">
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="block text-2xl font-black tracking-tight md:text-3xl"><GradientText>{s.value}</GradientText></span>
                      <span className="mt-1 block text-xs text-white/50">{s.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <Link href="/about/sourabh-goyal" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:underline">
                Read Sourabh&rsquo;s full story <Arrow />
              </Link>
            </Reveal>
          </div>

          <Reveal className="mx-auto mt-24 max-w-5xl px-6 text-center lg:px-10">
            <p className="text-balance text-[clamp(1.75rem,3.4vw,2.75rem)] font-black leading-[1.12] tracking-tight">
              We&rsquo;ve spent years studying how attention is earned, how communities are built, and how expertise becomes influence.
            </p>
            <p className="mt-6 text-xl font-semibold md:text-2xl"><GradientText>Now we do the same for founders.</GradientText></p>
          </Reveal>
        </section>

        {/* ══ 11 FINAL CTA ══════════════════════════════════════════════ */}
        <section ref={finalRef} id="cta" className="relative overflow-hidden border-t border-white/[0.06] bg-[#0B0B0B] text-white">
          <Glow variant="center" grid />
          <div className="relative mx-auto max-w-5xl px-6 py-28 text-center lg:px-10 lg:py-36">
            <Reveal>
              <h2 className="text-balance text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.98] tracking-tight">
                Your reputation is being built <GradientText>every day.</GradientText>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-balance text-xl text-white/70 md:text-2xl">
                The only question is whether you&rsquo;re building it intentionally.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white">
                Let&rsquo;s build a personal brand that works before you enter the room.
              </p>
              <div className="mt-12 flex flex-col items-center gap-5">
                <PrimaryCta tone="lime" className="h-14 px-8 text-base" />
                <p className="text-sm text-white/55">Strategy call &nbsp;•&nbsp; Personal positioning &nbsp;•&nbsp; Visibility roadmap</p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Mobile sticky CTA */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 p-3 backdrop-blur transition-transform duration-300 md:hidden ${showStickyCta ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showStickyCta}
      >
        <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" tabIndex={showStickyCta ? 0 : -1}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-primary text-[15px] font-semibold text-white">
          Build My Personal Brand <Arrow />
        </a>
      </div>

      <Footer siteSettings={siteSettings} />
    </MotionConfig>
  );
}

/** Audio testimonial: play/pause with a waveform that fills as it plays. */
function AudioTestimonial({ audioUrl, name, designation, company, takeaway }: (typeof AUDIO_TESTIMONIALS)[number]) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  // Deterministic bar heights so server and client render the same waveform.
  const bars = Array.from({ length: 48 }, (_, i) => 30 + Math.round(Math.abs(Math.sin(i * 1.7) * 55 + Math.sin(i * 0.45) * 15)));

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  }

  return (
    <figure className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={toggle} aria-label={playing ? `Pause ${name}'s testimonial` : `Play ${name}'s testimonial`}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <div className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden="true">
          {bars.map((h, i) => (
            <span key={i} className={`flex-1 rounded-full transition-colors ${i / bars.length < progress ? "bg-primary" : "bg-white/15"} ${playing && i / bars.length >= progress ? "animate-pulse" : ""}`}
              style={{ height: `${h}%` }} />
          ))}
        </div>
        {playing && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />}
      </div>
      <audio ref={audioRef} src={audioUrl} preload="none"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)} />
      <figcaption className="mt-5">
        <p className="text-[17px] font-semibold leading-snug">&ldquo;{takeaway}&rdquo;</p>
        <p className="mt-2 text-sm text-white/50">{name} · {designation}, {company}</p>
      </figcaption>
    </figure>
  );
}
