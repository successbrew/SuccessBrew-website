/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { SocialLinks, type SiteSettings } from "@/components/SocialLinks";

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
  { icon: "📂", label: "Course Categories" },
  { icon: "🎓", label: "Featured Courses" },
  { icon: "🤝", label: "Mentor Network" },
  { icon: "📖", label: "Resource Library" },
  { icon: "⭐", label: "Success Stories" },
];

export function CoursesPageClient({ siteSettings }: { siteSettings: SiteSettings }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <NavBar activePage="Courses" ctaText="Join Community" ctaHref="/community#cta" />
      <main className="min-h-screen bg-cream font-sans text-ink">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-ink pt-36 pb-28 lg:pt-44 lg:pb-36">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute right-[-80px] bottom-0 h-[400px] w-[400px] rounded-full bg-accent/15 blur-3xl" />
          </div>
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
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {sections.map((s) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,55,210,0.12)", transition: { duration: 0.25, ease: E } }}
                  className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink/10 bg-sand px-6 py-10 text-center cursor-default">
                  <motion.span
                    className="text-3xl"
                    whileHover={{ scale: 1.2, rotate: 5, transition: { duration: 0.2 } }}>
                    {s.icon}
                  </motion.span>
                  <p className="text-sm font-semibold text-ink/40">{s.label}</p>
                  <span className="rounded-full bg-ink/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink/30">
                    Coming Soon
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

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
