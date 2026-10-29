"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { BrewShader } from "@/components/about/BrewShader";
import { EcosystemOrbit, GrowthChart, JourneyRail, ParallaxGallery, ScrollWords, StrikeStatement } from "@/components/about/AboutMotion";
import {
  COMMUNITY_GALLERY,
  COMPANY_STATS,
  ECOSYSTEM,
  FOUNDER,
  FOUNDER_PROFILE_HREF,
  MILESTONES,
  ORIGIN_STORY,
  ROADMAP,
  VALUES,
} from "@/lib/content/about";

/* ──────────────────────────────────────────────────────────────────────────
 * About — the Successbrew story, told as one continuous scroll. The founder
 * has his own page at /about/sourabh-goyal; this page links to it from the
 * hero, the origin story and the founder block.
 * ────────────────────────────────────────────────────────────────────────── */

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

const GALLERY = [
  ...COMMUNITY_GALLERY,
  { src: "/founder-branding/community-meetup.jpg", alt: "A Successbrew community meetup" },
  { src: "/founder-branding/founder-on-stage.jpg", alt: "Sourabh on stage at a Successbrew event" },
];

function Kicker({ n, text }: { n: string; text: string }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{n} — {text}</p>;
}

/** Headline whose lines rise out of a mask one after another. */
function MaskLines({ lines, className = "" }: { lines: React.ReactNode[]; className?: string }) {
  return (
    <motion.span variants={stagger(0.12)} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block" variants={{ hidden: { y: "105%" }, visible: { y: "0%", transition: { duration: 1, ease: E } } }}>{l}</motion.span>
        </span>
      ))}
    </motion.span>
  );
}

function HeroStats() {
  const ref = useRef<HTMLDListElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <dl ref={ref} className="grid grid-cols-2 divide-white/10 border-t border-white/10 lg:grid-cols-4 lg:divide-x">
      {COMPANY_STATS.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 + i * 0.1, duration: 0.7, ease: E }}
          className="flex flex-col-reverse px-0 py-6 lg:px-8 lg:first:pl-0">
          <dt className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{s.label}</dt>
          <dd className={`text-3xl font-black tabular-nums tracking-tight md:text-4xl ${i === COMPANY_STATS.length - 1 ? "text-accent" : ""}`}>
            <AnimatedNumber value={s.value} inView={inView} />
          </dd>
        </motion.div>
      ))}
    </dl>
  );
}

/** Portrait that opens from a thin slit as it scrolls into view. */
function FounderReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.3"] });
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(0% 42% 0% 42% round 24px)", "inset(0% 0% 0% 0% round 24px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  return (
    <motion.div ref={ref} style={{ clipPath: clip }} className="relative aspect-[4/5] overflow-hidden rounded-3xl">
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image src="/founder-branding/sourabh-portrait.jpg" alt={FOUNDER.name} fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover object-top" />
      </motion.div>
    </motion.div>
  );
}

export function AboutPageClient({ siteSettings }: { siteSettings: SiteSettings }) {
  return (
    <MotionConfig reducedMotion="user">
      <NavBar variant="dark" activePage="About" ctaText="Join the Mission" ctaHref="/about#join" />
      <main className="overflow-x-clip bg-[#0B0B0B] font-sans text-white">

        {/* ══ HERO — live brew + the thesis ═════════════════════════════════ */}
        <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pt-32">
          <BrewShader />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0B0B0B] to-transparent" />
          <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.12)}>
              <motion.p variants={fadeUp} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" />About Successbrew</span>
                <span className="text-white/25">/</span><span>Est. 2018</span>
                <span className="text-white/25">/</span><span>Built in India</span>
              </motion.p>
              <h1 className="mt-8 text-[clamp(3.25rem,10vw,10rem)] font-black leading-[0.88] tracking-[-0.03em]">
                <MaskLines lines={["No talent", <>should go <span className="bg-gradient-to-r from-[#8FB0FF] via-white to-accent bg-clip-text text-transparent">unseen.</span></>]} />
              </h1>
              <div className="mt-10 grid gap-8 pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
                <motion.p variants={fadeUp} className="max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
                  Successbrew is the room India&rsquo;s ambitious people were missing — a community, content studio, podcast and events
                  platform where founders, creators and investors find each other.
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                  <a href="#story" className="group inline-flex h-14 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-[#111111] transition hover:bg-accent">
                    Read our story <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                  </a>
                  <Link href={FOUNDER_PROFILE_HREF} className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 px-7 text-[15px] font-semibold text-white backdrop-blur transition hover:border-white/50">
                    Meet the founder <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            <HeroStats />
          </div>
        </section>

        {/* ══ 01 THE BEGINNING — read by scrolling ═════════════════════════ */}
        <section id="story" className="scroll-mt-20 py-28 lg:py-40">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-10">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Kicker n="01" text="The beginning" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.4vw,4rem)] font-black leading-[1] tracking-tight">Why do talented people stay invisible?</h2>
              <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl">
                <Image src="/grid-images/IMG-20220514-WA0017.jpg" alt="An early roundtable between founders" fill sizes="(max-width:1024px) 100vw, 35vw" className="object-cover" />
                <span className="absolute bottom-4 left-4 rounded-full bg-[#0B0B0B]/80 px-4 py-2 text-xs font-semibold backdrop-blur">2018 · the first room</span>
              </div>
            </div>
            <div>
              <ScrollWords
                paragraphs={[...ORIGIN_STORY, "he built the room himself. That room became Successbrew."]}
                className="text-[clamp(1.5rem,2.6vw,2.4rem)] font-semibold leading-[1.3] tracking-tight" />
              <Link href={FOUNDER_PROFILE_HREF} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:underline">
                Read Sourabh&rsquo;s story <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══ 02 THE JOURNEY — pinned, horizontal ══════════════════════════ */}
        <JourneyRail milestones={MILESTONES} photos={COMMUNITY_GALLERY.slice(0, 3)} />

        {/* ══ 03 GROWTH ═════════════════════════════════════════════════════ */}
        <section className="py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <Kicker n="03" text="Growth" />
                <h2 className="mt-5 max-w-3xl text-balance text-[clamp(2.25rem,4.4vw,4rem)] font-black leading-[1] tracking-tight">
                  30 people to 8,000+. <span className="text-white/35">Next stop, a million.</span>
                </h2>
              </div>
              <p className="max-w-xs text-sm text-white/45">Community members, log scale. Solid line is where we&rsquo;ve been; dashed is the 2030 commitment.</p>
            </div>
            <div className="mt-14 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-4 sm:p-8">
              <GrowthChart />
            </div>
          </div>
        </section>

        {/* ══ 04 ECOSYSTEM ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#080808] py-28 lg:py-40">
          <div aria-hidden className="pointer-events-none absolute left-1/4 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-primary/20 blur-[160px]" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Kicker n="04" text="Successbrew today" />
            <h2 className="mt-5 mb-16 max-w-3xl text-balance text-[clamp(2.25rem,4.4vw,4rem)] font-black leading-[1] tracking-tight">Not a community. An ecosystem.</h2>
            <EcosystemOrbit nodes={ECOSYSTEM} />
          </div>
        </section>

        {/* ══ 05 PRINCIPLES ═════════════════════════════════════════════════ */}
        <section className="py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Kicker n="05" text="What we stand for" />
            <h2 className="mt-5 max-w-3xl text-balance text-[clamp(2.25rem,4.4vw,4rem)] font-black leading-[1] tracking-tight">Six principles. One direction.</h2>
            <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)} className="mt-16 border-t border-white/10">
              {VALUES.map((v, i) => (
                <motion.li key={v.title} variants={fadeUp}
                  className="group grid gap-3 border-b border-white/10 py-8 transition-colors hover:bg-white/[0.02] md:grid-cols-[5rem_1fr_1fr] md:items-baseline md:gap-8 md:py-10">
                  <span className="text-sm font-semibold tabular-nums text-white/30 transition-colors group-hover:text-accent">0{i + 1}</span>
                  <h3 className="text-[clamp(1.75rem,3.4vw,3rem)] font-black leading-none tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3">{v.title}</h3>
                  <p className="max-w-md text-base leading-relaxed text-white/45 transition-colors duration-300 group-hover:text-white/80">{v.desc}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* ══ 06 ROOMS LIKE THESE — parallax ═══════════════════════════════ */}
        <section className="overflow-hidden border-t border-white/[0.06] bg-[#080808] py-28 lg:py-40">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-10">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Kicker n="06" text="Behind the scenes" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.4vw,4rem)] font-black leading-[1] tracking-tight">Built in rooms like these.</h2>
              <p className="mt-6 max-w-sm text-lg text-white/55">Every photo here is a real Successbrew room — no stock, no stage-managed shoots.</p>
            </div>
            <ParallaxGallery photos={GALLERY} />
          </div>
        </section>

        {/* ══ STATEMENT ═════════════════════════════════════════════════════ */}
        <section className="py-28 lg:py-44">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-end lg:px-10">
            <StrikeStatement />
            <p className="max-w-sm text-lg leading-relaxed text-white/55">
              Products can be replicated. Systems can be automated. But the moment a person discovers what they&rsquo;re capable of — that&rsquo;s irreversible.
            </p>
          </div>
        </section>

        {/* ══ 07 ROADMAP — the climb to 2030 ═══════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#080808] py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Kicker n="07" text="The roadmap" />
                <h2 className="mt-5 max-w-2xl text-balance text-[clamp(2.25rem,4.4vw,4rem)] font-black leading-[1] tracking-tight">The climb to 1M by 2030.</h2>
              </div>
              <span className="rounded-full bg-accent px-5 py-2.5 text-sm font-black text-[#111111]">1,000,000 · 2030</span>
            </div>
            <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.12)}
              className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
              {ROADMAP.map((r, i) => (
                <motion.li key={r.title} variants={{ hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: E } } }}
                  style={{ ["--step" as string]: `${(ROADMAP.length - 1 - i) * 3.5}rem` }}
                  className="lg:mb-[var(--step)]">
                  <div className={`relative overflow-hidden rounded-3xl border p-6 ${i === ROADMAP.length - 1 ? "border-accent/50 bg-accent text-[#111111]" : "border-white/10 bg-white/[0.03]"}`}>
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${i === ROADMAP.length - 1 ? "text-[#111111]/60" : "text-accent"}`}>Phase 0{i + 1}</p>
                    <h3 className="mt-6 text-xl font-black tracking-tight">{r.title}</h3>
                    <p className={`mt-2 text-sm leading-relaxed ${i === ROADMAP.length - 1 ? "text-[#111111]/70" : "text-white/55"}`}>{r.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* ══ FOUNDER ═══════════════════════════════════════════════════════ */}
        <section className="py-28 lg:py-40">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-10">
            <FounderReveal />
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}>
              <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">The founder</motion.p>
              <motion.blockquote variants={fadeUp} className="mt-8 text-balance text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
                &ldquo;{FOUNDER.quote}&rdquo;
              </motion.blockquote>
              <motion.div variants={fadeUp} className="mt-10 border-t border-white/10 pt-6">
                <p className="text-xl font-black">{FOUNDER.name}</p>
                <p className="mt-1 text-white/50">{FOUNDER.role}</p>
                <p className="mt-6 max-w-lg leading-relaxed text-white/60">{FOUNDER.intro}</p>
                <Link href={FOUNDER_PROFILE_HREF} className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold transition hover:border-accent hover:bg-accent hover:text-[#111111]">
                  Read his story <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══ JOIN — the brew again ═════════════════════════════════════════ */}
        <section id="join" className="relative scroll-mt-20 overflow-hidden">
          <BrewShader intensity={1.2} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0B0B0B] to-transparent" />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}
            className="relative mx-auto max-w-7xl px-6 py-36 lg:px-10 lg:py-52">
            <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">You&rsquo;re invited</motion.p>
            <h2 className="mt-6 text-[clamp(3.25rem,10vw,9rem)] font-black leading-[0.88] tracking-[-0.03em]">
              <MaskLines lines={["Join the", <span key="m" className="text-accent">movement.</span>]} />
            </h2>
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center gap-3">
              <Link href="/apply?source=community" className="group inline-flex h-14 items-center gap-2 rounded-full bg-accent px-8 text-base font-semibold text-[#111111] transition hover:bg-white">
                Apply to Join Community <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link href="/community/events" className="inline-flex h-14 items-center gap-2 rounded-full border border-white/25 px-8 text-base font-semibold text-white backdrop-blur transition hover:border-white/60">
                Attend an event
              </Link>
              <Link href="/" className="inline-flex h-14 items-center gap-2 px-4 text-base font-semibold text-white/70 transition hover:text-white">
                Work with our studio →
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <Footer siteSettings={siteSettings} />
    </MotionConfig>
  );
}
