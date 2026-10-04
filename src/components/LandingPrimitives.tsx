"use client";

import { motion } from "framer-motion";
import type { CaseStudy } from "@/components/ServicesPageClient";

/* Shared building blocks for the dark brand pages
 * (/personal-branding, /about, /about/sourabh-goyal).
 *
 * Colour rules on dark: Persian Blue is a fill/glow colour (blue text fails
 * contrast on black); lime carries text accents and the blue→lime gradients. */

/** White-to-lime gradient text. Readable on dark backgrounds only. */
export function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-white via-[#E4FFA8] to-accent bg-clip-text text-transparent [box-decoration-break:clone] [-webkit-box-decoration-break:clone] ${className}`}>
      {children}
    </span>
  );
}

/** Blue→lime underline that follows the words across line breaks. */
export function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="bg-no-repeat pb-[0.04em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
      style={{
        backgroundImage: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
        backgroundSize: "100% 0.08em",
        backgroundPosition: "0 92%",
      }}
    >
      {children}
    </span>
  );
}

/** Static blue + lime glow behind a section (no motion — the site stays calm). */
export function Glow({ variant = "hero", grid = false }: { variant?: "hero" | "center" | "corner"; grid?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {variant === "hero" && (
        <>
          <div className="absolute -right-40 -top-48 h-[620px] w-[620px] rounded-full bg-primary/40 blur-[140px]" />
          <div className="absolute -left-40 bottom-[-180px] h-[420px] w-[420px] rounded-full bg-accent/[0.14] blur-[130px]" />
        </>
      )}
      {variant === "center" && (
        <>
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[760px] -translate-x-[65%] -translate-y-1/2 rounded-full bg-primary/35 blur-[140px]" />
          <div className="absolute left-1/2 top-1/2 h-[380px] w-[480px] -translate-x-[5%] -translate-y-[30%] rounded-full bg-accent/[0.16] blur-[130px]" />
        </>
      )}
      {variant === "corner" && (
        <>
          <div className="absolute -bottom-56 -left-24 h-[520px] w-[720px] rounded-full bg-primary/25 blur-[140px]" />
          <div className="absolute -right-24 -top-32 h-[340px] w-[340px] rounded-full bg-accent/[0.10] blur-[120px]" />
        </>
      )}
      {grid && (
        <div className="absolute inset-0 opacity-[0.06] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      )}
    </div>
  );
}

/** 1px blue→lime gradient border around a dark card. */
export function GradientBorder({ children, className = "", innerClassName = "" }: { children: React.ReactNode; className?: string; innerClassName?: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br from-accent/60 via-white/10 to-primary/80 p-px ${className}`}>
      <div className={`h-full rounded-[11px] ${innerClassName}`}>{children}</div>
    </div>
  );
}

export const E = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } },
};
export const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: E, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ n, text, tone = "light" }: { n: string; text: string; tone?: "light" | "dark" }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] ${tone === "dark" ? "text-white/50" : "text-ink/45"}`}>
      <span className={tone === "dark" ? "text-accent" : "text-primary"}>{n}</span>
      <span className={`h-px w-8 ${tone === "dark" ? "bg-white/25" : "bg-ink/20"}`} />
      {text}
    </p>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Pulls a headline number from a case study's own title/results text, e.g.
 * "535% Reach Growth" or "600K+ cumulative views". Null when there isn't one —
 * never invented. */
export function headlineMetric(c: CaseStudy): { value: string; label: string } | null {
  const src = `${c.title} ${c.results}`;
  const m = src.match(/(\d[\d,.]*\s?(?:%|[KkMm]\+?|\+|x))\s+([A-Za-z][A-Za-z-]*(?:\s+[A-Za-z][A-Za-z-]*)?)/);
  return m ? { value: m[1].replace(/\s/g, ""), label: m[2].toLowerCase() } : null;
}

/** Founder/personal-brand case studies first, then the rest. */
export function pickFounderCaseStudies(all: CaseStudy[], count = 3): CaseStudy[] {
  const score = (c: CaseStudy) => (/personal|founder|thought leadership|linkedin/i.test(`${c.tag} ${c.title}`) ? 1 : 0);
  return [...all].filter((c) => c.imageUrl).sort((a, b) => score(b) - score(a)).slice(0, count);
}
