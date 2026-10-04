"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { Arrow, E, Glow, GradientBorder, GradientText, Mark, Reveal, SectionLabel, fadeUp, stagger } from "@/components/LandingPrimitives";
import { BOOKING_URL, ECOSYSTEMS, FOUNDER_STATS } from "@/lib/content/founder-branding";
import { FOCUS_AREAS, FOUNDER, FOUNDER_GALLERY, LETTER, ORIGIN_STORY } from "@/lib/content/about";

/* ──────────────────────────────────────────────────────────────────────────
 * /about/sourabh-goyal — the founder's profile.
 * Pattern (portfolio / personal brand): name + role hero → credibility →
 * story → focus areas → stages → philosophy → moments → letter → contact.
 * ────────────────────────────────────────────────────────────────────────── */

const btn =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-[6px] px-6 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink";
const btnBlue = `${btn} bg-gradient-to-r from-primary to-[#1F55E8] text-white shadow-[0_10px_30px_-10px_rgba(0,60,209,0.8)] hover:from-white hover:to-white hover:text-ink`;
const btnLime = `${btn} bg-accent text-ink shadow-[0_10px_30px_-10px_rgba(198,255,58,0.55)] hover:bg-white`;
const btnGhost = `${btn} border border-white/15 text-white hover:border-white/40 hover:bg-white/5`;

export function FounderProfilePageClient({ siteSettings }: { siteSettings: SiteSettings }) {
  const [first, ...rest] = FOUNDER.name.split(" ");

  return (
    <MotionConfig reducedMotion="user">
      <NavBar variant="dark" activePage="About" ctaText="Work with Sourabh" ctaHref="/personal-branding" />
      <main className="overflow-x-hidden bg-ink font-sans text-white">

        {/* ══ HERO ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#0B0B0B] pt-28 pb-20 lg:pt-36 lg:pb-28">
          <Glow variant="hero" grid />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}>
              <motion.nav variants={fadeUp} aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.1em] text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <Link href="/about" className="underline-offset-4 transition-colors hover:text-white hover:underline">About</Link>
                <span aria-hidden="true">/</span>
                <span className="text-white" aria-current="page">Founder</span>
              </motion.nav>
              <motion.h1 variants={fadeUp} className="mt-6 text-[clamp(3.25rem,8vw,7rem)] font-black leading-[0.9] tracking-tight">
                {first}<br /><GradientText>{rest.join(" ")}</GradientText>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-lg font-semibold text-white/80">{FOUNDER.role}</motion.p>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-lg text-white/55">{FOUNDER.intro}</motion.p>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="/personal-branding" className={btnBlue}>
                  Work with Sourabh <Arrow className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a href="#story" className={btnGhost}>His story <span aria-hidden="true">↓</span></a>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9, ease: E }}
              className="relative mx-auto w-full max-w-[460px] pb-8 lg:mr-0">
              <GradientBorder innerClassName="overflow-hidden bg-ink">
                <div className="relative aspect-[4/5]">
                  <Image src="/founder-branding/sourabh-portrait.jpg" alt={`${FOUNDER.name}, ${FOUNDER.role}`} fill priority
                    sizes="(max-width:1024px) 90vw, 40vw" className="object-cover object-top" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                </div>
              </GradientBorder>
              <div className="absolute -left-4 bottom-0 rounded-[6px] bg-accent px-5 py-3.5 text-ink shadow-[0_14px_40px_-12px_rgba(198,255,58,0.55)] sm:-left-8">
                <p className="text-2xl font-black leading-none">2018</p>
                <p className="mt-1 text-xs font-semibold text-ink/70">Founded Successbrew</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ CREDIBILITY STRIP ══════════════════════════════════════════ */}
        <section className="border-y border-white/[0.06] bg-ink">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
            {FOUNDER_STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse bg-ink px-6 py-8 lg:px-10">
                <dt className="mt-1 text-sm text-white/50">{s.label}</dt>
                <dd className="text-4xl font-black tracking-tight md:text-5xl"><GradientText>{s.value}</GradientText></dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ══ 01 STORY ═══════════════════════════════════════════════════ */}
        <section id="story" className="scroll-mt-20 py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20 lg:px-10">
            <Reveal>
              <SectionLabel n="01" text="His story" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.6vw,4rem)] font-black leading-[1.02] tracking-tight">
                Why do talented people stay <Mark>invisible?</Mark>
              </h2>
              <div className="mt-8 space-y-5 text-[17px] text-white/55">
                {ORIGIN_STORY.map((p) => <p key={p}>{p}</p>)}
              </div>
              <p className="mt-6 text-2xl font-black leading-snug tracking-tight">
                He built it himself. That room became <GradientText>Successbrew.</GradientText>
              </p>
              <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline">
                The Successbrew story <Arrow />
              </Link>
            </Reveal>
            <Reveal delay={0.1} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image src="/grid-images/our-why-founder.jpg" alt="Sourabh Goyal" fill sizes="(max-width:1024px) 100vw, 40vw"
                  className="object-cover object-[44%_center]" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ 02 WHAT HE DOES ════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0B0B0B] py-24 lg:py-32">
          <Glow variant="corner" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="02" text="What he works on" tone="dark" />
              <h2 className="mt-5 max-w-3xl text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                Where content, community and entrepreneurship <GradientText>meet.</GradientText>
              </h2>
            </Reveal>
            <motion.ul initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
              className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FOCUS_AREAS.map((f, i) => (
                <motion.li key={f.title} variants={fadeUp}
                  className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary to-accent" />
                  <span className="inline-grid h-9 w-9 place-items-center rounded-[6px] bg-gradient-to-br from-primary to-[#1F55E8] text-xs font-semibold">0{i + 1}</span>
                  <h3 className="mt-5 text-lg font-black tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[15px] text-white/55">{f.desc}</p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* ══ 03 STAGES ══════════════════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-10">
            <Reveal className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
                <Image src="/grid-images/TEdx 1.jpeg" alt="On the TEDxCVS stage with the organising team" fill
                  sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <SectionLabel n="03" text="Spoken at & worked with" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2rem,4vw,3.25rem)] font-black leading-[1.05] tracking-tight">
                On stages and in classrooms across India.
              </h2>
              <ul className="mt-8 flex flex-wrap gap-2">
                {ECOSYSTEMS.map((e) => (
                  <li key={e} className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-white/80">{e}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ══ PHILOSOPHY ═════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#003CD1_0%,#002A93_55%,#0B1640_100%)] py-28 lg:py-36">
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 -bottom-32 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[130px]" />
          <Reveal className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
            <svg className="mx-auto h-10 w-10 text-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9.5 6C6.5 7.2 4.5 9.8 4.5 13v5h6v-6H7.6c.2-2 1.4-3.5 3.3-4.3L9.5 6zm9 0c-3 1.2-5 3.8-5 7v5h6v-6h-2.9c.2-2 1.4-3.5 3.3-4.3L18.5 6z" />
            </svg>
            <blockquote className="mt-8 text-balance text-[clamp(2.25rem,5.5vw,4.75rem)] font-black leading-[1.02] tracking-tight">
              Teach what you do, not just what you know. <GradientText>That&rsquo;s what people trust.</GradientText>
            </blockquote>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.1em] text-white/60">— {FOUNDER.name}</p>
          </Reveal>
        </section>

        {/* ══ 04 MOMENTS ═════════════════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="04" text="Moments" tone="dark" />
              <h2 className="mt-5 text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-black leading-[1.03] tracking-tight">
                In the room with founders.
              </h2>
            </Reveal>
            <div className="mt-14 grid auto-rows-[240px] gap-3 sm:grid-cols-2 md:auto-rows-[280px] lg:grid-cols-3">
              {FOUNDER_GALLERY.map((g, i) => (
                <Reveal key={g.src} delay={i * 0.05}
                  className={`group relative overflow-hidden rounded-xl border border-white/10 ${i === 0 ? "sm:col-span-2 sm:row-span-2" : i === FOUNDER_GALLERY.length - 1 ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                  <Image src={g.src} alt={g.alt} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 05 LETTER ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0B0B0B] py-24 lg:py-32">
          <Glow variant="corner" />
          <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
            <Reveal>
              <SectionLabel n="05" text="A personal note" tone="dark" />
              <h2 className="mt-5 text-[clamp(2rem,4vw,3rem)] font-black tracking-tight">A letter from Sourabh</h2>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <GradientBorder innerClassName="bg-[#111111] p-8 md:p-12">
                <p className="text-2xl font-black leading-snug tracking-tight">
                  &ldquo;If one person receives an opportunity because of this community, <GradientText>the mission is worth it.</GradientText>&rdquo;
                </p>
                <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-white/65">
                  {LETTER.map((p) => <p key={p}>{p}</p>)}
                </div>
                <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-8">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-accent/60">
                    <Image src="/founder-branding/sourabh-portrait.jpg" alt="" fill sizes="48px" className="object-cover object-top" />
                  </div>
                  <div>
                    <p className="font-semibold">{FOUNDER.name}</p>
                    <p className="text-sm text-white/50">{FOUNDER.role}</p>
                  </div>
                </div>
              </GradientBorder>
            </Reveal>
          </div>
        </section>

        {/* ══ CONTACT ════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0B0B0B]">
          <Glow variant="center" grid />
          <div className="relative mx-auto max-w-4xl px-6 py-28 text-center lg:px-10 lg:py-36">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">Work with Sourabh&rsquo;s team</p>
              <h2 className="mt-5 text-balance text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.98] tracking-tight">
                Build a brand people <GradientText>trust.</GradientText>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
                The same playbook that built Successbrew — positioning, content and community — for founders and leaders.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/personal-branding" className={`${btnLime} h-14 px-8 text-base`}>
                  Explore Founder Led Growth <Arrow className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={`${btnGhost} h-14 px-8 text-base`}>
                  Book a discovery call
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer siteSettings={siteSettings} />
    </MotionConfig>
  );
}
