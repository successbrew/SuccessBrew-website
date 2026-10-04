"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig, useInView } from "framer-motion";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Arrow, E, Glow, GradientBorder, GradientText, Mark, Reveal, SectionLabel, fadeUp, stagger } from "@/components/LandingPrimitives";
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
 * About — the Successbrew story. The founder has his own page at
 * /about/sourabh-goyal; this page links to it from the hero, the origin story
 * and the "Meet the founder" block.
 * ────────────────────────────────────────────────────────────────────────── */

const btn =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-[6px] px-6 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink";
const btnBlue = `${btn} bg-gradient-to-r from-primary to-[#1F55E8] text-white shadow-[0_10px_30px_-10px_rgba(0,60,209,0.8)] hover:from-white hover:to-white hover:text-ink`;
const btnLime = `${btn} bg-accent text-ink shadow-[0_10px_30px_-10px_rgba(198,255,58,0.55)] hover:bg-white`;
const btnGhost = `${btn} border border-white/15 text-white hover:border-white/40 hover:bg-white/5`;

export function AboutPageClient({ siteSettings }: { siteSettings: SiteSettings }) {
  const statsRef = useRef<HTMLDListElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  return (
    <MotionConfig reducedMotion="user">
      <NavBar variant="dark" activePage="About" ctaText="Join the Mission" ctaHref="/about#join" />
      <main className="overflow-x-hidden bg-ink font-sans text-white">

        {/* ══ HERO ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#0B0B0B] pt-28 pb-20 lg:pt-36 lg:pb-28">
          <Glow variant="hero" grid />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}>
              <motion.p variants={fadeUp} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                About · The Successbrew story
              </motion.p>
              <motion.h1 variants={fadeUp} className="mt-6 text-balance text-[clamp(2.75rem,6vw,5.5rem)] font-black leading-[0.96] tracking-tight">
                Building opportunity for the <GradientText>next generation.</GradientText>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-white/60 md:text-xl">
                One person&rsquo;s question. Thousands of people&rsquo;s success. A movement that&rsquo;s only just getting started.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-3">
                <a href="#story" className={btnBlue}>Read our story <span aria-hidden="true">↓</span></a>
                <Link href={FOUNDER_PROFILE_HREF} className={btnGhost}>
                  Meet the founder <Arrow className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
              <motion.dl variants={fadeUp} className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/10 pt-8">
                {[
                  { v: "8,000+", l: "Members" },
                  { v: "200+", l: "Events" },
                  { v: "1M", l: "Entrepreneurs by 2030", gradient: true },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col-reverse">
                    <dt className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-white/45">{s.l}</dt>
                    <dd className="text-3xl font-black tracking-tight">{s.gradient ? <GradientText>{s.v}</GradientText> : s.v}</dd>
                  </div>
                ))}
              </motion.dl>
            </motion.div>

            {/* Community collage */}
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9, ease: E }}
              className="relative pb-16 lg:pb-0">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image src="/grid-images/IMG_9736.JPG" alt="A packed Successbrew community event" fill priority
                  sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              </div>
              <GradientBorder className="absolute -bottom-2 left-4 w-[46%] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] lg:-left-10 lg:bottom-10" innerClassName="overflow-hidden bg-ink">
                <div className="relative aspect-[4/3]">
                  <Image src="/grid-images/20220423062049_IMG_2072.JPG" alt="Founders at an early Successbrew meetup" fill
                    sizes="(max-width:1024px) 45vw, 20vw" className="object-cover" />
                </div>
              </GradientBorder>
              <div className="absolute right-4 top-4 rounded-[6px] bg-accent px-4 py-3 text-ink shadow-[0_10px_30px_-10px_rgba(198,255,58,0.6)]">
                <p className="text-2xl font-black leading-none">2018</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/70">Where it began</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ 01 THE BEGINNING ═══════════════════════════════════════════ */}
        <section id="story" className="scroll-mt-20 border-t border-white/[0.06] py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-10">
            <Reveal className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10">
                <Image src="/grid-images/IMG-20220514-WA0017.jpg" alt="An early roundtable between founders" fill
                  sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
              </div>
              <div className="absolute -bottom-5 left-5 rounded-[6px] bg-gradient-to-r from-primary to-[#0A2A8F] px-5 py-3.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">It started with</p>
                <p className="text-lg font-black">a simple question.</p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <SectionLabel n="01" text="The beginning" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.6vw,4rem)] font-black leading-[1.02] tracking-tight">
                Why do talented people stay <Mark>invisible?</Mark>
              </h2>
              <div className="mt-8 space-y-5 text-[17px] text-white/55">
                {ORIGIN_STORY.map((p) => <p key={p}>{p}</p>)}
              </div>
              <p className="mt-6 text-2xl font-black leading-snug tracking-tight">
                He built it himself. That room became <GradientText>Successbrew.</GradientText>
              </p>
              <Link href={FOUNDER_PROFILE_HREF} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline">
                Read Sourabh&rsquo;s story <Arrow />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ══ 02 THE JOURNEY ═════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0B0B0B] py-24 lg:py-32">
          <Glow variant="corner" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="02" text="The journey" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.6vw,4rem)] font-black leading-[1.02] tracking-tight">
                From 30 people in a room to <GradientText>an ecosystem.</GradientText>
              </h2>
            </Reveal>

            <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="relative mt-16 grid gap-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
              <span aria-hidden="true" className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-primary via-primary/70 to-accent md:hidden lg:block lg:bottom-auto lg:left-0 lg:right-0 lg:top-5 lg:h-px lg:w-auto lg:bg-gradient-to-r" />
              {MILESTONES.map((m, i) => {
                const isLast = i === MILESTONES.length - 1;
                return (
                  <motion.li key={m.year} variants={fadeUp} className="relative pl-14 md:pl-0">
                    <span className={`absolute left-0 top-0 z-10 grid h-10 w-10 place-items-center rounded-full text-xs font-semibold ring-4 ring-[#0B0B0B] md:relative
                      ${isLast ? "bg-accent text-ink" : "bg-primary text-white"}`}>
                      &rsquo;{m.year.slice(2)}
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40 md:mt-6">{m.year}</p>
                    <h3 className={`mt-1 text-xl font-black tracking-tight ${isLast ? "text-accent" : ""}`}>{m.title}</h3>
                    <p className="mt-2 text-sm text-white/55">{m.desc}</p>
                  </motion.li>
                );
              })}
            </motion.ol>
          </div>
        </section>

        {/* ══ NORTH STAR ═════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#003CD1_0%,#002A93_55%,#0B1640_100%)] py-28 lg:py-40">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-accent/25 blur-[130px]" />
          <Reveal className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Our north star</p>
            <h2 className="mt-6 text-balance text-[clamp(3rem,8.5vw,7.5rem)] font-black leading-[0.9] tracking-tight">
              No talent should go <GradientText>unseen.</GradientText>
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-lg text-white/70">
              Every city has thousands of people with world-class potential and no address to send their ambition.
              Successbrew is that address.
            </p>
          </Reveal>
        </section>

        {/* ══ 03 WHAT SUCCESSBREW IS TODAY ═══════════════════════════════ */}
        <section className="border-t border-white/[0.06] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="03" text="Successbrew today" tone="dark" />
              <h2 className="mt-5 max-w-3xl text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                Not just a community. <Mark>An ecosystem.</Mark>
              </h2>
            </Reveal>
            <motion.ul initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
              className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ECOSYSTEM.map((e, i) => (
                <motion.li key={e.title} variants={fadeUp}>
                  <Link href={e.href}
                    className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary to-accent opacity-60 transition-opacity group-hover:opacity-100" />
                    <span className="text-xs text-white/35">0{i + 1}</span>
                    <h3 className="mt-6 text-xl font-black tracking-tight">{e.title}</h3>
                    <p className="mt-2 flex-1 text-[15px] text-white/55">{e.desc}</p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      {e.cta} <Arrow className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* ══ 04 VALUES ══════════════════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] bg-[#0B0B0B] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <div>
                <SectionLabel n="04" text="What we stand for" tone="dark" />
                <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                  Six principles. <GradientText>One direction.</GradientText>
                </h2>
              </div>
              <p className="max-w-md text-lg text-white/55 lg:justify-self-end">
                The beliefs behind every event we host, every piece of content we make and every introduction we make.
              </p>
            </Reveal>
            <motion.ul initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.06)}
              className="mt-14 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((v, i) => (
                <motion.li key={v.title} variants={fadeUp} className="bg-[#0B0B0B] p-7 transition-colors hover:bg-[#121212]">
                  <span className="inline-grid h-9 w-9 place-items-center rounded-[6px] bg-gradient-to-br from-primary to-[#1F55E8] text-xs font-semibold">0{i + 1}</span>
                  <h3 className="mt-5 text-lg font-black tracking-tight">{v.title}</h3>
                  <p className="mt-2 text-[15px] text-white/55">{v.desc}</p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* ══ 05 GALLERY ═════════════════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="05" text="Behind the scenes" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                Built in rooms like these.
              </h2>
            </Reveal>
            <div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-3 md:auto-rows-[260px] md:grid-cols-4">
              {COMMUNITY_GALLERY.map((g, i) => (
                <Reveal key={g.src} delay={(i % 4) * 0.05}
                  className={`group relative overflow-hidden rounded-xl border border-white/10 ${
                    i === 0 ? "col-span-2 row-span-2" : i === 5 ? "col-span-2" : i >= 3 ? "md:col-span-2" : ""
                  }`}>
                  <Image src={g.src} alt={g.alt} fill sizes="(max-width:768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 06 IMPACT ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0B0B0B] py-24 lg:py-32">
          <Glow variant="center" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="text-center">
              <SectionLabel n="06" text="The impact, so far" tone="dark" />
            </Reveal>
            <dl ref={statsRef} className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 lg:grid-cols-4">
              {COMPANY_STATS.map((s) => (
                <div key={s.label} className="flex flex-col-reverse items-center bg-[#0B0B0B]/80 px-4 py-10 text-center backdrop-blur">
                  <dt className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/50">{s.label}</dt>
                  <dd className="text-[clamp(2.5rem,5vw,4.25rem)] font-black leading-none tracking-tight">
                    <GradientText><AnimatedNumber value={s.value} inView={statsInView} /></GradientText>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ══ PEOPLE OVER PRODUCTS ═══════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] py-28 lg:py-40">
          <div className="mx-auto max-w-5xl px-6 text-center lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}>
              {[
                { t: "We don’t build", dim: true },
                { t: "products.", dim: false },
                { t: "We build", dim: true },
                { t: "people.", gradient: true },
              ].map((l) => (
                <motion.p key={l.t} variants={fadeUp}
                  className={`text-[clamp(3rem,9vw,8rem)] font-black leading-[0.92] tracking-tight ${l.dim ? "text-white/30" : ""}`}>
                  {l.gradient ? <GradientText>{l.t}</GradientText> : l.t}
                </motion.p>
              ))}
            </motion.div>
            <Reveal className="mx-auto mt-12 max-w-lg">
              <p className="text-lg text-white/55">
                Products can be replicated. Systems can be automated. But the moment a person discovers what they&rsquo;re
                capable of — that&rsquo;s irreversible.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ══ 07 ROADMAP ═════════════════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] bg-[#0B0B0B] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="07" text="The roadmap" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                What comes next — on the way to <GradientText>1M by 2030.</GradientText>
              </h2>
            </Reveal>
            <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
              className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {ROADMAP.map((r, i) => (
                <motion.li key={r.title} variants={fadeUp} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent" style={{ opacity: 0.35 + i * 0.16 }} />
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">Phase 0{i + 1}</p>
                  <h3 className="mt-4 text-lg font-black tracking-tight">{r.title}</h3>
                  <p className="mt-2 text-sm text-white/55">{r.desc}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* ══ MEET THE FOUNDER ═══════════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <GradientBorder innerClassName="bg-[#0F0F0F]">
                <Link href={FOUNDER_PROFILE_HREF}
                  className="group grid overflow-hidden rounded-[11px] md:grid-cols-[0.8fr_1.2fr] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                  <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[360px]">
                    <Image src="/founder-branding/sourabh-portrait.jpg" alt={FOUNDER.name} fill sizes="(max-width:768px) 100vw, 40vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]" />
                  </div>
                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/45">Meet the founder</p>
                    <h2 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-black leading-[1.02] tracking-tight">{FOUNDER.name}</h2>
                    <p className="mt-2 text-white/55">{FOUNDER.role}</p>
                    <p className="mt-6 text-xl font-semibold leading-snug">&ldquo;<GradientText>{FOUNDER.quote}</GradientText>&rdquo;</p>
                    <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                      Read his story <Arrow className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </GradientBorder>
            </Reveal>
          </div>
        </section>

        {/* ══ JOIN ═══════════════════════════════════════════════════════ */}
        <section id="join" className="relative scroll-mt-20 overflow-hidden border-t border-white/[0.06] bg-[#0B0B0B]">
          <Glow variant="center" grid />
          <div className="relative mx-auto max-w-4xl px-6 py-28 text-center lg:px-10 lg:py-36">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">You&rsquo;re invited</p>
              <h2 className="mt-5 text-balance text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.92] tracking-tight">
                Join the <GradientText>movement.</GradientText>
              </h2>
              <p className="mx-auto mt-6 max-w-md text-lg text-white/60">Success is brewed together. Your seat at this table is waiting.</p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/apply?source=community" className={`${btnLime} h-14 px-8 text-base`}>
                  Apply to Join Community <Arrow className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/community/events" className={`${btnGhost} h-14 px-8 text-base`}>Attend an event</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer siteSettings={siteSettings} />
    </MotionConfig>
  );
}
