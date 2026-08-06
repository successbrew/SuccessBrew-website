"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, animate } from "framer-motion";
import { Users, BookOpen, TrendingUp, Globe, Star, Zap, ArrowRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { SectionWave } from "@/components/SectionWave";

// ── Easing curve ─────────────────────────────────────────────────────────────
const E = [0.22, 1, 0.36, 1] as const;

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({
  from,
  to,
  duration,
  prefix = "",
  suffix = "",
}: {
  from: number;
  to: number;
  duration: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        if (ref.current) ref.current.textContent = `${prefix}${Math.floor(value).toLocaleString("en-US")}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, from, to, duration, prefix, suffix]);

  return (
    <span ref={ref}>
      {prefix}
      {from}
      {suffix}
    </span>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const milestones = [
  { year: "2018", title: "First Idea",       desc: "The initial blueprint sketched out over late-night conversations about why talent stays invisible." },
  { year: "2019", title: "First Event",      desc: "A small gathering of 30 people in Bengaluru. No sponsors. No stage. Just raw conviction." },
  { year: "2020", title: "Community Launch", desc: "Took the movement online. One WhatsApp group became ten. Founders, students, creators — all connected." },
  { year: "2021", title: "Growth Phase",     desc: "500 members. Monthly events. Guest speakers. SuccessBrew becomes the word people say when they want their people." },
  { year: "2022", title: "Expansion",        desc: "Chapters in three cities. Podcast launches. 2,000 members. First founders close pre-seed rounds." },
  { year: "2023", title: "Ecosystem Born",   desc: "Brand, studio, platform — formalized. Not just a community. An ecosystem. A promise: 1 lakh entrepreneurs by 2030." },
];

const values = [
  { Icon: Users,      title: "Community First",      desc: "Nobody succeeds alone. We build together, celebrate together, and lift each other up — always." },
  { Icon: BookOpen,   title: "Relentless Learning",   desc: "Curiosity is the unfair advantage. We create resources and mentors that keep builders compounding." },
  { Icon: TrendingUp, title: "Compound Growth",       desc: "Show up daily. Give generously. The results compound in ways you can't plan for." },
  { Icon: Zap,        title: "Create Opportunity",    desc: "Don't wait for a seat at the table. Build the table. Then invite everyone else." },
  { Icon: Star,       title: "Servant Leadership",    desc: "The community is the hero, not the founder. Every decision is made with that belief at its center." },
  { Icon: Globe,      title: "Global Impact",         desc: "India-built, universally relevant. Our metric isn't followers — it's lives permanently changed." },
];

const gallery = [
  { src: "/grid-images/IMG_9736.JPG",               alt: "Community event" },
  { src: "/grid-images/Teach-1.jpg",                alt: "Workshop session" },
  { src: "/grid-images/IMG_6949.JPG",               alt: "Founders gathering" },
  { src: "/grid-images/Teach-2.jpg",                alt: "Mentoring moment" },
  { src: "/grid-images/20220423062049_IMG_2072.JPG", alt: "Early event" },
  { src: "/grid-images/Teach-3.jpg",                alt: "Workshop" },
];

// ════════════════════════════════════════════════════════════════════════════
export function AboutPageClient({ siteSettings }: { siteSettings: SiteSettings }) {
  return (
    <>
      <NavBar variant="dark" activePage="About" ctaText="Join the Mission" ctaHref="/about#join" />
      <main className="min-h-screen overflow-x-hidden bg-[#111111] text-white">

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO  (dark, two-column, real founder photo)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen items-center bg-[#111111] pt-16 overflow-hidden">
        <AmbientBackground tone="dark" noise={false} />
        {/* grid texture */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

            {/* Left: copy */}
            <motion.div className="flex flex-col" initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}>
              <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } } }}
                className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#C1FF3B]/30 bg-[#C1FF3B]/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C1FF3B]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C1FF3B]">The Story Behind Successbrew</span>
              </motion.div>

              <motion.h1 variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: E } } }}
                className="text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-[0.9] tracking-tight text-white">
                Building<br />Opportunity<br />For The<br /><span className="text-[#C1FF3B]">Next Generation.</span>
              </motion.h1>

              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } } }}
                className="mt-6 max-w-md text-lg leading-8 text-white/60">
                One person&apos;s vision. Thousands of people&apos;s success. A movement that&apos;s only just getting started.
              </motion.p>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } } }}
                className="mt-10 flex flex-wrap gap-3">
                <a href="#story"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#111111] transition hover:bg-white/90 hover:-translate-y-0.5">
                  Meet The Founder <ArrowRight className="h-4 w-4" />
                </a>
                <Link href="/community"
                  className="inline-flex items-center gap-2 rounded-full border border-white/22 px-7 py-3.5 text-sm font-bold text-white transition hover:border-white/45 hover:bg-white/6">
                  Join The Movement
                </Link>
              </motion.div>

              {/* mini stats */}
              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.7, ease: E } } }}
                className="mt-12 flex items-center gap-6 border-t border-white/10 pt-10">
                {[
                  { v: "8,000+", l: "Members" },
                  { v: "54+",    l: "Events" },
                  { v: "1 Lakh", l: "Goal by 2030", lime: true },
                ].map((s, i) => (
                  <React.Fragment key={s.l}>
                    {i > 0 && <div className="h-7 w-px bg-white/12" />}
                    <div className="text-center">
                      <div className={`text-xl font-black leading-none ${s.lime ? "text-[#C1FF3B]" : "text-white"}`}>{s.v}</div>
                      <div className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">{s.l}</div>
                    </div>
                  </React.Fragment>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: portrait */}
            <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: E, delay: 0.2 }} className="relative">
              <div className="relative mx-auto max-w-[460px] lg:ml-auto">
                {/* glow ring */}
                <div className="absolute -inset-4 rounded-[2.5rem] bg-[#0037D2]/20 blur-2xl" />
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl">
                  <Image src="/grid-images/sourabh-323.jpg" alt="Sourabh — Founder of Successbrew"
                    fill priority sizes="(max-width:1024px) 80vw, 40vw" className="object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/50 via-transparent to-transparent" />
                </div>
                {/* year badge */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.75, duration: 0.65, ease: E }}
                  className="absolute -bottom-4 -left-4 rounded-2xl bg-[#C1FF3B] px-5 py-3.5 text-[#111111] shadow-xl">
                  <div className="text-2xl font-black leading-none">2018</div>
                  <div className="mt-1 text-[11px] font-semibold opacity-65">Where it began</div>
                </motion.div>
                {/* vision badge */}
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.65, ease: E }}
                  className="absolute -right-4 top-10 rounded-2xl border border-white/12 bg-[#111111]/85 px-5 py-3 backdrop-blur-xl shadow-xl">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#C1FF3B]">Vision 2030</div>
                  <div className="mt-1 text-base font-black text-white">1 Lakh Entrepreneurs</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/28">Scroll</span>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>
      <SectionWave from="#111111" to="#0a0a0a" />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — THE BEGINNING  (dark editorial)
      ════════════════════════════════════════════════════════════════════ */}
      <section id="story" className="bg-[#0a0a0a] py-24 lg:py-36 border-t border-white/6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">

            {/* Image */}
            <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.85, ease: E }} className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#0037D2]/30 to-transparent blur-xl" />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                <Image src="/grid-images/Teach-5.jpg" alt="Early days of building"
                  fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/50 to-transparent" />
              </div>
              <div className="absolute -bottom-5 left-6 rounded-xl bg-[#0037D2] px-5 py-3 text-white shadow-xl shadow-[#0037D2]/30">
                <div className="text-[11px] font-bold uppercase tracking-widest opacity-70">Started with a</div>
                <div className="text-lg font-black">Simple Question.</div>
              </div>
            </motion.div>

            {/* Story */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
              className="flex flex-col pt-4 lg:pt-0">
              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } } }}
                className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">The Beginning</motion.p>

              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}
                aria-hidden className="mt-4 select-none text-[clamp(6rem,14vw,11rem)] font-black leading-none text-[#0037D2]/20">
                &quot;
              </motion.div>

              <motion.h2 variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: E } } }}
                className="-mt-6 text-[clamp(2rem,4vw,3rem)] font-black leading-tight tracking-tight text-white">
                Why do talented people<br />stay invisible?
              </motion.h2>

              <div className="mt-8 space-y-5 text-base leading-8 text-white/50">
                {[
                  "Growing up, he saw classmates with extraordinary ideas — people who could have built companies, led movements, changed industries. Most of them never got the chance. Not because they lacked talent. Because they lacked access.",
                  "He graduated in 2018. No startup ecosystem in his city. No community for first-time founders. No playbook for people who wanted to build but didn't know where to begin.",
                  "So he did what any builder does when they can't find the room they need —",
                ].map((p, i) => (
                  <motion.p key={i} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: E } } }}>
                    {p}
                  </motion.p>
                ))}
                <motion.p variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: E } } }}
                  className="text-xl font-black text-white">
                  He built it himself. That room became SuccessBrew.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <SectionWave from="#0a0a0a" to="#111111" />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — THE JOURNEY  (dark, timeline)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#111111] py-24 lg:py-36 border-t border-white/6 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.75, ease: E }}
            className="mb-16">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">The Journey</p>
            <h2 className="text-[clamp(2.4rem,5vw,4rem)] font-black tracking-tight text-white">Six years. One mission.</h2>
          </motion.div>

          {/* Desktop: horizontal */}
          <div className="hidden md:block">
            <div className="relative">
              {/* static base line */}
              <div className="absolute top-[27px] left-7 right-7 h-px bg-white/8" />
              {/* animated progress line */}
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
                className="absolute top-[27px] left-7 right-7 h-px bg-[#0037D2] origin-left" />

              <div className="grid grid-cols-6 gap-3">
                {milestones.map((m, i) => (
                  <motion.div key={m.year} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.1, duration: 0.65, ease: E }}
                    className="flex flex-col items-center">
                    <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-xs font-black border-2 transition-colors ${
                      i === milestones.length - 1
                        ? "border-[#C1FF3B] bg-[#C1FF3B] text-[#111111]"
                        : "border-white/20 bg-[#111111] text-white/40"
                    }`}>{m.year.slice(2)}</div>
                    <div className="mt-6 w-full rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#C1FF3B]">{m.year}</div>
                      <div className="mb-2 text-sm font-black text-white">{m.title}</div>
                      <p className="text-[11px] leading-[1.75] text-white/40">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: vertical */}
          <div className="flex flex-col md:hidden">
            {milestones.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.07, duration: 0.6, ease: E }}
                className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                    i === milestones.length - 1 ? "bg-[#C1FF3B] text-[#111111]" : "border border-white/18 text-white/40"
                  }`}>{m.year.slice(2)}</div>
                  {i < milestones.length - 1 && <div className="mt-2 w-px flex-1 bg-white/10 mb-2" />}
                </div>
                <div className="flex-1 rounded-2xl border border-white/8 bg-white/[0.03] p-5 mb-4">
                  <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#C1FF3B]">{m.year}</div>
                  <div className="mb-2 text-sm font-black text-white">{m.title}</div>
                  <p className="text-xs leading-7 text-white/40">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <SectionWave from="#111111" to="#0037D2" />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4 — THE MISSION  (Persian Blue, enormous type)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0037D2] py-32 lg:py-44">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: E }}
          className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-10">
          <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">Our North Star</p>
          <h2 className="text-[clamp(3rem,9vw,8.5rem)] font-black leading-[0.86] tracking-tighter text-white">
            NO TALENT<br />SHOULD GO<br /><span className="text-[#C1FF3B]">UNSEEN.</span>
          </h2>
          <p className="mx-auto mt-10 max-w-xl text-lg leading-8 text-white/55">
            Every city has thousands of people with world-class potential and no address to send their ambition. SuccessBrew is that address.
          </p>
        </motion.div>
      </section>
      <SectionWave from="#0037D2" to="#111111" />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 5 — VALUES  (dark cards, dark bg — NOT white/cream)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#111111] py-24 lg:py-36 border-t border-white/6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.75, ease: E }}
            className="mb-14">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">What We Stand For</p>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-black tracking-tight text-white">
              Six principles.<br />One direction.
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.65, ease: E }}
                whileHover={{ y: -5 }} className="cursor-default">
                <Card className="h-full rounded-[24px] border border-white/8 bg-white/[0.03] p-7 shadow-none transition-shadow hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.5)] hover:border-white/14">
                  <CardContent className="p-0">
                    <div className="mb-5 grid h-11 w-11 place-items-center rounded-[14px] bg-[#0037D2]/25 text-[#C1FF3B]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-3 text-base font-black text-white">{title}</h3>
                    <p className="text-sm leading-7 text-white/45">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <SectionWave from="#111111" to="#0a0a0a" />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 6 — GALLERY  (dark, local images, masonry columns)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0a0a0a] py-24 lg:py-36 border-t border-white/6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.75, ease: E }}
            className="mb-12">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">Behind The Scenes</p>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-black tracking-tight text-white">
              Building it from<br />the ground up.
            </h2>
          </motion.div>

          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {gallery.map(({ src, alt }, i) => (
              <motion.div key={src} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.65, ease: E }}
                whileHover={{ scale: 1.02 }}
                className={`group relative overflow-hidden rounded-[20px] border border-white/7 bg-[#1a1a1a] ${
                  i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-square"
                }`}>
                <Image src={src} alt={alt} fill
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <SectionWave from="#0a0a0a" to="#F2ECDD" />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 7 — LETTER  (THE ONE LIGHT SECTION — cream by intent)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F2ECDD] py-24 lg:py-36">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: E }}
            className="mb-10">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0037D2]">A Personal Note</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-black tracking-tight text-[#111111]">Letter from the Founder</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }} transition={{ delay: 0.15, duration: 0.9, ease: E }}
            className="rounded-[2rem] border border-[#111111]/8 bg-white p-8 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.14)] md:p-14">
            {/* author */}
            <div className="mb-10 flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#0037D2]/20">
                <Image src="/grid-images/Sourabh-sir.jpg" alt="Sourabh" fill sizes="56px" className="object-cover object-top" />
              </div>
              <div>
                <div className="text-sm font-black text-[#111111]">Sourabh</div>
                <div className="text-xs text-[#999]">Founder, SuccessBrew</div>
              </div>
            </div>

            {/* letter body */}
            <div className="space-y-6 font-serif text-[17px] italic leading-[1.95] text-[#333]">
              <p className="text-xl font-bold not-italic text-[#0037D2] leading-8">
                &ldquo;If one person receives an opportunity because of this community, the mission is worth it.&rdquo;
              </p>
              <p>I didn&apos;t start SuccessBrew because I had it all figured out. I started it because I didn&apos;t — and I couldn&apos;t find anyone willing to help me figure it out either. The meetings I needed weren&apos;t happening. The introductions weren&apos;t being made. The rooms I needed to be in were closed to me.</p>
              <p>So I decided those rooms shouldn&apos;t exist in the first place. Not closed rooms. Open tables. Places where the student next to the investor next to the creator next to the operator is a completely normal thing.</p>
              <p>What I&apos;ve learned is that opportunity isn&apos;t rare. Access is. And when you remove that barrier — even slightly — extraordinary things happen. Companies get built. Careers change direction. Ideas that would have died in someone&apos;s notebook find their way into the world.</p>
              <p>SuccessBrew is my commitment to keep removing that barrier. For every person who walks in unsure of where they belong and walks out knowing exactly who they are and what they&apos;re building.</p>
              <p>We&apos;re just getting started. And this is your invitation.</p>
            </div>

            {/* signature */}
            <div className="mt-10 border-t border-[#111111]/8 pt-8">
              <div className="font-serif text-[2.8rem] font-bold italic leading-none tracking-tight text-[#111111]">Sourabh</div>
              <div className="mt-2 text-sm text-[#999]">Founder & Chief Brewer, SuccessBrew</div>
            </div>
          </motion.div>
        </div>
      </section>
      <SectionWave from="#F2ECDD" to="#111111" />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 8 — THE IMPACT  (dark, lime counters)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#111111] py-24 lg:py-36 border-t border-white/6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.75, ease: E }}
            className="mb-20 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">By The Numbers</p>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-black tracking-tight text-white">The impact, so far.</h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-16">
            {[
              { from: 0, to: 8000, suffix: "+",  label: "Community Members",    duration: 2 },
              { from: 0, to: 150,   suffix: "K+", label: "Monthly Reach",        duration: 1.8 },
              { from: 0, to: 54,    suffix: "+",  label: "Events Hosted",        duration: 1.5 },
              { from: 0, to: 1,     suffix: "L",  label: "Entrepreneurs by 2030",duration: 1.2 },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-3 text-center">
                <div className="text-[clamp(2.8rem,6vw,5rem)] font-black leading-none tracking-tight text-[#C1FF3B]">
                  <AnimatedCounter from={s.from} to={s.to} duration={s.duration} suffix={s.suffix} />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionWave from="#111111" to="#0037D2" />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 9 — PEOPLE OVER PRODUCTS  (blue, full-viewport reveal)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="flex min-h-screen items-center bg-[#0037D2] py-24 px-4">
        <div className="mx-auto max-w-5xl w-full text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.16 } } }}>
            {([
              { text: "WE DON'T BUILD", dim: true },
              { text: "PRODUCTS.",      dim: false },
              { text: "WE BUILD",       dim: true },
              { text: "PEOPLE.",        dim: false, lime: true },
            ] as { text: string; dim: boolean; lime?: boolean }[]).map(line => (
              <motion.div key={line.text}
                variants={{ hidden: { opacity: 0, y: 44 }, visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: E } } }}
                className={`block text-[clamp(3rem,10vw,9rem)] font-black leading-[0.86] tracking-tighter ${
                  line.lime ? "text-[#C1FF3B]" : line.dim ? "text-white/45" : "text-white"
                }`}>
                {line.text}
              </motion.div>
            ))}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mx-auto mt-14 max-w-lg text-lg leading-8 text-white/50">
            Products can be replicated. Systems can be automated. But the moment a person discovers what they&apos;re capable of — that&apos;s irreversible.
          </motion.p>
        </div>
      </section>
      <SectionWave from="#0037D2" to="#111111" />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 10 — WHAT COMES NEXT  (dark, horizontal scroll on mobile)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#111111] py-24 lg:py-36 border-t border-white/6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.75, ease: E }}
            className="mb-12">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">The Roadmap</p>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-black tracking-tight text-white">What comes next.</h2>
          </motion.div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-5 hide-scrollbar">
            {[
              { n: "01", t: "More Cities",     d: "SuccessBrew chapters in 20+ Indian cities so no ambitious person is limited by geography." },
              { n: "02", t: "10K Founders",    d: "Founders who found their co-founder, investor, or first customer through this community." },
              { n: "03", t: "Creator Economy", d: "A new wave of Indian creators building businesses and brands from their bedrooms." },
              { n: "04", t: "Direct Access",   d: "Fellowships and grants flowing straight to the people who deserve them — no gatekeepers." },
              { n: "05", t: "Global Stage",    d: "India's startup story on the world stage, with SuccessBrew alumni at the center of it." },
            ].map((v, i) => (
              <motion.div key={v.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.65, ease: E }}
                whileHover={{ y: -6 }}
                className="w-[80vw] shrink-0 snap-start sm:w-[45vw] lg:w-auto rounded-[20px] border border-white/8 bg-white/[0.03] p-6 cursor-default transition-colors hover:border-white/16">
                <div className="mb-5 text-[11px] font-black uppercase tracking-widest text-[#C1FF3B]">Phase {v.n}</div>
                <h3 className="mb-3 text-base font-black text-white">{v.t}</h3>
                <p className="text-sm leading-7 text-white/42">{v.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CTA  (dark, blue radial glow)
      ════════════════════════════════════════════════════════════════════ */}
      <section id="join" className="relative overflow-hidden bg-[#111111] py-36 text-center border-t border-white/6">
        {/* glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-[700px] w-[700px] rounded-full bg-[#0037D2]/28 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } } }}
              className="mb-6 text-[11px] font-bold uppercase tracking-[0.28em] text-[#C1FF3B]/65">
              You&apos;re invited
            </motion.p>
            <motion.h2 variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: E } } }}
              className="text-[clamp(3.5rem,9vw,7.5rem)] font-black leading-[0.88] tracking-tighter text-white">
              JOIN THE<br /><span className="text-[#C1FF3B]">MOVEMENT.</span>
            </motion.h2>
            <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.7, ease: E } } }}
              className="mx-auto mt-8 max-w-md text-lg leading-8 text-white/50">
              Success is brewed together. Your seat at this table is waiting.
            </motion.p>
            <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } } }}
              className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Button asChild className="rounded-full bg-[#C1FF3B] px-9 py-7 text-base font-bold text-[#111111] shadow-none hover:bg-[#b0e633]">
                <Link href="/apply">Join Community <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/22 bg-transparent px-9 py-7 text-base font-bold text-white shadow-none hover:bg-white/8 hover:text-white">
                <Link href="/community">Attend an Event</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer siteSettings={siteSettings} />
    </main>
    </>
  );
}
