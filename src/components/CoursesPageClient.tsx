/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { SectionWave } from "@/components/SectionWave";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } },
};
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";

// Text scramble effect
function ScrambleText({ text, trigger }: { text: string; trigger: boolean }) {
  const [display, setDisplay] = useState(text);
  const done = useRef(false);

  useEffect(() => {
    if (!trigger || done.current) return;
    done.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let iteration = 0;
    const total = text.length * 4;
    const id = setInterval(() => {
      setDisplay(
        text.split("").map((char, i) => {
          if (char === " " || char === "\n") return char;
          if (i < Math.floor(iteration / 4)) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      iteration++;
      if (iteration >= total) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [trigger, text]);

  return <>{display}</>;
}

const sections = [
  { icon: "📂", label: "Course Categories", desc: "Curated tracks across growth, content, and fundraising." },
  { icon: "🎓", label: "Featured Courses", desc: "Deep-dive programs taught by operators who've done it." },
  { icon: "🤝", label: "Mentor Network", desc: "1:1 access to founders, VCs and specialists who open doors." },
  { icon: "📖", label: "Resource Library", desc: "Templates, playbooks and frameworks ready to use." },
  { icon: "⭐", label: "Success Stories", desc: "Real outcomes from founders who leveled up with us." },
];

function bentoSpan(i: number, total: number) {
  if (i === 0 || i === total - 1) return "lg:col-span-2";
  if (i === 2) return "lg:col-span-1 lg:row-span-2";
  return "lg:col-span-1";
}

export function CoursesPageClient({ siteSettings }: { siteSettings: SiteSettings }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <NavBar activePage="Courses" ctaText="Join Community" ctaHref="/community#cta" />
      <main className="min-h-screen bg-cream font-sans text-ink">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-ink pt-36 pb-28 lg:pt-44 lg:pb-36">
          <AmbientBackground tone="dark" />
          <div ref={heroRef} className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.12)}>
              <motion.div variants={fadeUp}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                In the works
              </motion.div>

              <motion.h1 variants={fadeUp}
                className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.92] tracking-tight text-white">
                Coming
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">
                    <ScrambleText text="Soon." trigger={heroInView} />
                  </span>
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-accent md:h-6" />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-lg text-lg text-white/45">
                We're building something big — courses, mentors, and a full learning ecosystem for ambitious founders. Stay tuned.
              </motion.p>
              <motion.a variants={fadeUp} href="/community#cta"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-ink transition hover:translate-y-[-2px]">
                Join the Community in the meantime
              </motion.a>
            </motion.div>
          </div>
        </section>
        <SectionWave from="var(--ink)" to="var(--background)" />

        {/* ══ SECTIONS PREVIEW ═══════════════════════════════════════════ */}
        <section className="bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-10 text-xs font-bold uppercase tracking-[0.22em] text-ink/30">
              What's coming
            </motion.p>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.08)}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
              {sections.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,55,210,0.12)", transition: { duration: 0.25, ease: E } }}
                  className={`group relative flex flex-col justify-center gap-3 overflow-hidden rounded-3xl border border-dashed border-ink/10 bg-sand px-7 py-8 cursor-default ${bentoSpan(i, sections.length)}`}>
                  <span className="absolute right-5 top-5 rounded-full bg-ink/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink/30">
                    Coming Soon
                  </span>
                  <motion.span
                    className="block text-5xl"
                    whileHover={{ scale: 1.2, rotate: 5, transition: { duration: 0.2 } }}>
                    {s.icon}
                  </motion.span>
                  <p className="mt-2 text-lg font-bold text-ink/70">{s.label}</p>
                  <p className="text-sm leading-6 text-ink/40">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <SectionWave from="var(--background)" to="var(--sand)" />

        {/* ══ NOTIFY CTA ════════════════════════════════════════════════ */}
        <section className="bg-sand py-20 lg:py-24">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger(0.12)}>
              <motion.h2 variants={fadeUp} className="text-3xl font-black tracking-tight text-ink md:text-5xl">
                Don't want to miss it?
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-ink/50">
                Join our community — you'll be the first to know when courses launch.
              </motion.p>
              <motion.a variants={fadeUp} href="/community#cta"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-white transition hover:translate-y-[-2px]">
                Join Successbrew Community
              </motion.a>
            </motion.div>
          </div>
        </section>
        <SectionWave from="var(--sand)" to="var(--ink)" />

        <Footer siteSettings={siteSettings} />

      </main>
    </>
  );
}
