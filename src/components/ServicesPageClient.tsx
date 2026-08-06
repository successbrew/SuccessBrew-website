/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useAnimationFrame, useScroll, useMotionValueEvent } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Carousel, type CarouselHandle } from "@/components/ui/carousel";
import { LogoShowcase, type BrandPartner } from "@/components/LogoShowcase";
import type { SiteSettings } from "@/components/SocialLinks";
import { ExpandableQuote } from "@/components/ExpandableQuote";
import { Footer } from "@/components/Footer";
import { WordReveal } from "@/components/WordReveal";
import { AmbientBackground } from "@/components/AmbientBackground";
import { SectionWave } from "@/components/SectionWave";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export interface Service {
  _id: string;
  num: string;
  title: string;
  description: string;
  tags: string[];
}
export interface ProcessStep {
  _id: string;
  stepNumber: string;
  title: string;
  description: string;
}
export interface CaseStudy {
  _id: string;
  tag: string;
  title: string;
  imageUrl: string | null;
  problem: string;
  strategy: string;
  results: string;
  reverseLayout: boolean;
  showOnHomepage?: boolean;
  pdfUrl?: string | null;
}
export interface Testimonial {
  _id: string;
  quote: string;
  name: string;
  role: string;
  initial: string;
  avatarUrl?: string | null;
  cardStyle: "sand" | "dark";
  avatarStyle: "primary" | "accent";
}
export interface Stat {
  _id: string;
  number: string;
  label: string;
  colorScheme: "default" | "primary" | "accent";
}
export interface ServicesPageProps {
  services: Service[];
  processSteps: ProcessStep[];
  caseStudies: CaseStudy[];
  testimonials: Testimonial[];
  stats: Stat[];
  brandPartners: BrandPartner[];
  siteSettings: SiteSettings;
}

// â"€â"€ Animation config â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const E = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } },
};

const stagger = (delay = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

// â"€â"€ Color maps â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const statBg: Record<string, string> = {
  default: "bg-sand text-ink",
  primary: "bg-primary text-primary-foreground",
  accent:  "bg-accent text-ink",
};
const cardBg: Record<string, string> = {
  sand: "bg-sand text-ink",
  dark: "bg-cream text-ink",
};
const avatarBg: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  accent:  "bg-accent text-ink",
};


// ── Typewriter — letter-by-letter typing effect ─────────────────────────────
function Typewriter({ text, delay = 300, speed = 42 }: { text: string; delay?: number; speed?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || count >= text.length) return;
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [started, count, text.length, speed]);

  if (reducedMotion) return <>{text}</>;

  return (
    <>
      {text.slice(0, count)}
      {count < text.length && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          className="ml-[2px] inline-block h-[0.82em] w-[3px] translate-y-[0.05em] rounded-sm bg-primary align-middle"
        />
      )}
    </>
  );
}

// â"€â"€ Animated stat counter â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  const match = value.match(/^([\d,]+)([KMkm]?)(\+?)$/);
  const target = match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!match || !inView || started.current) return;
    started.current = true;
    const duration = 1400;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, match]);

  if (!match) return <>{value}</>;
  const [, , suffix, plus] = match;
  const formatted = target >= 1000 ? count.toLocaleString("en-IN") : count;
  return <>{formatted}{suffix}{plus}</>;
}

// â"€â"€ Magnetic button â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// Hover button — scales up slightly so the cursor's position over it reads clearly, no cursor-chasing wobble
function MagneticButton({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return (
    <motion.a href={href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }} className={className}>
      {children}
    </motion.a>
  );
}

// ── DraggableMarquee — continuously auto-slides at a constant speed; grab and
// drag to take manual control, release and it picks the same speed back up
// from wherever you left it (no snapping/jumping). Hovering pauses it. ──────
function DraggableMarquee({
  children,
  pxPerSecond = 36,
  trackClassName = "",
}: {
  children: React.ReactNode;
  pxPerSecond?: number;
  trackClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [loopWidth, setLoopWidth] = useState(0);
  const isPaused = useRef(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (trackRef.current) setLoopWidth(trackRef.current.scrollWidth / 2);
  }, [children]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useAnimationFrame((_, delta) => {
    if (!loopWidth || isPaused.current || reducedMotion.current) return;
    let next = x.get() - (pxPerSecond * delta) / 1000;
    // content is duplicated once, so wrapping at -loopWidth is a seamless loop point
    if (next <= -loopWidth) next += loopWidth;
    x.set(next);
  });

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <motion.div
        ref={trackRef}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -loopWidth, right: 0 }}
        dragElastic={0.12}
        onDragStart={() => { isPaused.current = true; }}
        onDragEnd={() => { isPaused.current = false; }}
        onMouseEnter={() => { isPaused.current = true; }}
        onMouseLeave={() => { isPaused.current = false; }}
        className={`flex w-max cursor-grab active:cursor-grabbing ${trackClassName}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ── Case studies: same compact teaser card as before, paged 3-at-a-time as a
// single row (rendered inside the reusable <Carousel> primitive). Swiping
// moves a full page at a time; an incomplete last page keeps its grid shape
// with blank filler slots rather than partially scrolling. Unlimited items —
// add or remove case studies and the page count just adjusts. ─────────────
const CASE_STUDY_PAGE_SIZE = 3;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

function CaseStudyCard({ cs, i }: { cs: CaseStudy; i: number }) {
  return (
    <motion.a href={`/case-studies?cs=${cs._id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: (i % 3) * 0.08, ease: E } }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -5, transition: { duration: 0.25, ease: E } }}
      className="group block overflow-hidden rounded-2xl border border-ink/5 bg-background transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)]">
      <div className="relative h-52 overflow-hidden">
        <img src={cs.imageUrl ?? "/grid-images/IMG_9736.JPG"} alt={cs.title} draggable={false}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">{cs.tag}</span>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-black tracking-tight">{cs.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm font-semibold text-primary">{cs.results}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/50 transition group-hover:gap-2.5 group-hover:text-ink">
          View case study
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </motion.a>
  );
}

function CaseStudyGrid({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const carouselRef = useRef<CarouselHandle>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (caseStudies.length === 0) return null;

  const pages = chunk(caseStudies, CASE_STUDY_PAGE_SIZE);

  return (
    <div>
      <Carousel
        ref={carouselRef}
        trackClassName="snap-x snap-mandatory"
        showArrows={false}
        onIndexChange={setActiveIndex}
      >
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="grid w-full shrink-0 snap-start grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: CASE_STUDY_PAGE_SIZE }).map((_, slot) => {
              const cs = page[slot];
              return cs ? (
                <CaseStudyCard key={cs._id} cs={cs} i={slot} />
              ) : (
                <div key={slot} aria-hidden="true" className="rounded-2xl border border-dashed border-ink/10" />
              );
            })}
          </div>
        ))}
      </Carousel>

      {pages.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2.5">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1} of ${pages.length}`}
              onClick={() => carouselRef.current?.scrollToIndex(i)}
              className="relative h-2.5 w-8 overflow-hidden rounded-full bg-ink/10 transition-colors hover:bg-ink/20"
            >
              {activeIndex === i && (
                <motion.span
                  layoutId="case-study-page-indicator"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ServiceCard — click-to-expand card, wired to open the details modal ──────
function ServiceCard({ svc, onOpen }: { svc: Service; onOpen: () => void }) {
  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: E } } }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: E } }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-ink/5 bg-background p-8 hover:border-primary/30 hover:shadow-[0_30px_60px_-30px_oklch(0.16_0.02_260_/_0.35)] md:p-10">
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.22em] text-ink/40">
          <span>{svc.num}</span>
          <motion.span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-accent"
            whileHover={{ scale: 1.6 }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <h3 className="mt-8 text-2xl font-extrabold tracking-tight md:text-3xl">{svc.title}</h3>
        <p className="mt-4 text-ink/60">{svc.description}</p>
      </div>
      <div className="mt-10 flex flex-wrap gap-2">
        {(svc.tags ?? []).map((t) => (
          <span key={t} className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink/70 transition group-hover:bg-primary/8">{t}</span>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        View details <span aria-hidden="true">→</span>
      </span>
      {/* shimmer border on hover */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px oklch(0.45 0.22 264 / 0.2)" }} />
    </motion.article>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ServicesPageClient({ services, processSteps, caseStudies, testimonials, stats, brandPartners, siteSettings }: ServicesPageProps) {
  const statsRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLOListElement>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });
  const { scrollYProgress: processProgress } = useScroll({ target: processRef, offset: ["start 85%", "end 65%"] });
  const [activeStep, setActiveStep] = useState(-1);
  useMotionValueEvent(processProgress, "change", (v) => {
    const n = processSteps.length;
    if (n === 0) return;
    setActiveStep(Math.min(n - 1, Math.floor(v * n)));
  });

  return (
    <>
      <NavBar activePage="Services" ctaText="Book a Call" ctaHref="https://ntis.in/7oApLV" />
      <main className="bg-background font-sans text-ink">

        {/* â•â• HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section className="relative overflow-hidden bg-cream pt-32 pb-24 lg:pt-40 lg:pb-32">
          <AmbientBackground tone="light" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.12)}>
              <motion.div variants={fadeUp}
                className="mb-10 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Successbrew · Content Marketing Company
              </motion.div>

              {/* Typewriter headline */}
              <h1 className="text-[clamp(2.75rem,7vw,6.5rem)] font-black leading-[0.95] tracking-tight text-ink">
                <Typewriter text="We Brew Brand's Growth Via Content and Community" delay={400} speed={40} />
              </h1>

              <motion.div variants={fadeUp} className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
                <p className="max-w-xl text-balance text-lg text-ink/70 md:text-xl">
                  Content, community, and visibility for ambitious brands.
                </p>
                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <MagneticButton href="https://ntis.in/7oApLV"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-[0_10px_40px_-10px_oklch(0.45_0.22_264_/_0.6)]">
                    Book Discovery Call
                  </MagneticButton>
                  <MagneticButton href="#work"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-background px-7 py-4 text-base font-semibold text-ink hover:bg-sand">
                    Explore Case Studies
                  </MagneticButton>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.9, ease: E }}
              className="group relative mt-16 overflow-hidden rounded-[2rem] border border-ink/5 bg-ink shadow-[0_40px_80px_-30px_oklch(0.16_0.02_260_/_0.25)]">
              {/* TODO: swap for the real studio video — set `src` on the <video> tag below */}
              <video className="h-[280px] w-full object-cover md:h-[520px]" poster="/grid-images/service-page.jpg" muted loop playsInline controls>
                Your browser does not support embedded video.
              </video>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-6px_oklch(0.45_0.22_264_/_0.5)] transition-transform group-hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </span>
              </div>
            </motion.div>
          </div>
        </section>
        <SectionWave from="var(--cream)" to="var(--background)" />

        <LogoShowcase brandPartners={brandPartners} />

        {/* â•â• STATS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section className="bg-background py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.12)} className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">By the numbers</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Not just a content marketing system, but a global Ecosystem that your brand needs." /></h2>
              </motion.div>
            </motion.div>

            <div ref={statsRef} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map((s, i) => (
                <motion.div key={s._id}
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.65, ease: E, delay: i * 0.1 }}
                  whileHover={{ y: -6, boxShadow: "0 24px 60px -10px rgba(0,0,0,0.18)", transition: { duration: 0.25, ease: E } }}
                  className={`group relative overflow-hidden rounded-3xl border border-ink/5 p-8 md:p-10 cursor-default ${statBg[s.colorScheme] ?? statBg.default}`}>
                  <div className="text-[clamp(1.5rem,4.5vw,2.75rem)] font-black tracking-tight whitespace-nowrap">
                    <AnimatedNumber value={s.number} inView={statsInView} />
                  </div>
                  <div className="mt-6 text-base font-medium opacity-60">{s.label}</div>
                  {/* Hover glow */}
                  <div aria-hidden="true" className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-background/25 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <SectionWave from="var(--background)" to="var(--sand)" />

        {/* â•â• SERVICES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section id="services" className="bg-sand py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.1)} className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">What we do</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Everything your brand needs. In one place." /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="#cta" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline">
                Start a project
              </motion.a>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.08)} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map((svc) => (
                <ServiceCard key={svc._id} svc={svc} onOpen={() => setExpandedCard(svc._id)} />
              ))}
            </motion.div>
          </div>
        </section>
        <SectionWave from="var(--sand)" to="var(--background)" />

        {/* Service card expanded modal */}
        <AnimatePresence>
          {expandedCard && (() => {
            const svc = services.find(s => s._id === expandedCard);
            if (!svc) return null;
            return (
              <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
                onClick={() => setExpandedCard(null)}
              >
                <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
                <motion.div
                  key="modal-panel"
                  initial={{ opacity: 0, scale: 0.94, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] bg-background p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
                >
                  <button
                    onClick={() => setExpandedCard(null)}
                    className="absolute right-6 top-6 grid h-9 w-9 place-items-center rounded-full bg-ink/6 text-ink/50 transition hover:bg-ink/12 hover:text-ink"
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/35">{svc.num}</p>
                  <h3 className="mt-4 text-3xl font-black tracking-tight">{svc.title}</h3>
                  <p className="mt-5 text-base leading-relaxed text-ink/65">{svc.description}</p>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {(svc.tags ?? []).map((t) => (
                      <span key={t} className="rounded-full bg-sand px-4 py-1.5 text-sm font-semibold text-ink/70">{t}</span>
                    ))}
                  </div>
                  <a href="#cta" onClick={() => setExpandedCard(null)}
                    className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_oklch(0.45_0.22_264_/_0.5)] transition hover:translate-y-[-2px]">
                    Start a project
                  </a>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
        {/* â•â• PROCESS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section id="process" className="bg-background py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.1)} className="mb-20 max-w-3xl">
              <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-primary">How we work</motion.p>
              <h2 className="mt-3 text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="A five-step process." /></h2>
            </motion.div>
            <motion.ol ref={processRef} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.14)} className="relative grid gap-6 md:grid-cols-5">
              <div aria-hidden="true" className="absolute left-0 right-0 top-6 hidden h-px bg-ink/10 md:block" />
              <motion.div aria-hidden="true" style={{ scaleX: processProgress }}
                className="absolute left-0 right-0 top-6 hidden h-px origin-left bg-primary md:block" />
              {processSteps.map((step, i) => {
                const isActive = i <= activeStep;
                return (
                <motion.li key={step._id}
                  variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } } }}
                  className="relative">
                  <motion.div
                    animate={{
                      backgroundColor: isActive ? "oklch(0.45 0.22 264)" : "oklch(1 0 0)",
                      color: isActive ? "#fff" : "oklch(0.16 0.02 260)",
                      scale: isActive ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    whileHover={{ scale: 1.12, backgroundColor: "oklch(0.45 0.22 264)", color: "#fff" }}
                    className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-ink/10 text-sm font-bold tracking-tight cursor-default">
                    {step.stepNumber}
                  </motion.div>
                  <h3 className={`mt-6 text-xl font-extrabold tracking-tight transition-colors duration-300 ${isActive ? "text-primary" : "text-ink"}`}>{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{step.description}</p>
                  {i === processSteps.length - 1 && (
                    <motion.span
                      initial={{ scale: 0 }} whileInView={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 400 }}
                      className="absolute -top-1 right-0 hidden h-4 w-4 rounded-full bg-accent md:block" />
                  )}
                </motion.li>
                );
              })}
            </motion.ol>
          </div>
        </section>
        <SectionWave from="var(--background)" to="var(--cream)" />

        {/* â•â• WORK â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section id="work" className="bg-cream py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.1)} className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Selected work</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Results that compound." /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="/case-studies" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline">
                See all case studies
              </motion.a>
            </motion.div>
            <CaseStudyGrid caseStudies={caseStudies} />
          </div>
        </section>
        <SectionWave from="var(--cream)" to="var(--background)" />

        {/* â•â• VOICES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section id="voices" className="bg-background py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={stagger(0.1)} className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Founder voices</p>
                <h2 className="mt-3 text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Trusted by the operators we are built for." /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="/testimonials" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline">
                Read all testimonials
              </motion.a>
            </motion.div>
            {testimonials.length > 0 && (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1, transition: { duration: 0.8, ease: E } }}
                viewport={{ once: true, margin: "-60px" }}
                className="-mx-6 lg:-mx-10">
                <DraggableMarquee trackClassName="items-stretch gap-5 px-6 lg:px-10">
                  {[...testimonials, ...testimonials].map((t, i) => (
                    <figure key={`${t._id}-${i}`}
                      className={`flex w-[320px] shrink-0 flex-col justify-between rounded-3xl border border-ink/5 p-8 md:w-[380px] md:p-10 ${cardBg[t.cardStyle] ?? cardBg.sand}`}>
                      <blockquote className="text-balance text-lg font-medium leading-snug md:text-xl">
                        <ExpandableQuote
                          quote={t.quote}
                          name={t.name}
                          role={t.role}
                          initial={t.initial}
                          avatarUrl={t.avatarUrl}
                          readMoreClassName="mt-3 block text-sm font-semibold underline underline-offset-2 opacity-70 transition hover:opacity-100"
                        />
                      </blockquote>
                      <figcaption className="mt-10 flex items-center gap-4">
                        {t.avatarUrl ? (
                          <img src={t.avatarUrl} alt={t.name} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                        ) : (
                          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold ${avatarBg[t.avatarStyle] ?? avatarBg.primary}`}>{t.initial}</span>
                        )}
                        <div>
                          <div className="text-sm font-semibold">{t.name}</div>
                          <div className="line-clamp-2 text-xs opacity-60">{t.role}</div>
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </DraggableMarquee>
              </motion.div>
            )}
          </div>
        </section>
        <SectionWave from="var(--background)" to="var(--primary)" />

        {/* â•â• CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section id="cta" className="relative overflow-hidden bg-primary text-primary-foreground">
          <AmbientBackground tone="dark" />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            variants={stagger(0.14)}
            className="relative mx-auto max-w-7xl px-6 py-28 text-center lg:px-10 lg:py-40">
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground/70">Let's build</motion.p>
            <motion.h2 variants={fadeUp}
              className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">
              Ready To Build <br /><span className="text-accent">Momentum?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-xl text-lg text-primary-foreground/70">
              A 30-minute call with our strategy team. No pitch deck. Just clarity on what your next 90 days could look like.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton href="https://ntis.in/7oApLV"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-ink">
                Book A Strategy Call
              </MagneticButton>
              <MagneticButton href="#work"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10">
                See the work
              </MagneticButton>
            </motion.div>
          </motion.div>
        </section>
        <SectionWave from="var(--primary)" to="var(--ink)" />

        {/* â•â• FOOTER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <Footer siteSettings={siteSettings} />

      </main>
    </>
  );
}
