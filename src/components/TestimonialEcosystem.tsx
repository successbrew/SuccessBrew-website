/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { ExpandableQuote } from "@/components/ExpandableQuote";
import { SectionWave } from "@/components/SectionWave";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import type { Testimonial } from "@/components/ServicesPageClient";

const E = [0.22, 1, 0.36, 1] as const;
const stagger = (d = 0.07) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });
const cardUp = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: E } },
};

type Theme = "studio" | "community";

interface ThemeTokens {
  cardBg: Record<string, string>;
  cardIsDark: Record<string, boolean>;
  avatarBg: Record<string, string>;
  quoteMark: Record<string, string>;
  gridBg: string;
  gridWave: string;
  emptyText: string;
  featuredBg: string;
  featuredWave: string;
  featuredText: string;
  dotActive: string;
  dotInactive: string;
}

const THEMES: Record<Theme, ThemeTokens> = {
  studio: {
    cardBg: { sand: "bg-sand text-ink", dark: "bg-sand text-ink" },
    cardIsDark: { sand: false, dark: false },
    avatarBg: { primary: "bg-primary text-white", accent: "bg-accent text-ink" },
    quoteMark: { sand: "text-primary/15", dark: "text-primary/15" },
    gridBg: "bg-background",
    gridWave: "var(--background)",
    emptyText: "text-ink/40",
    featuredBg: "bg-primary",
    featuredWave: "var(--primary)",
    featuredText: "text-primary-foreground",
    dotActive: "#C1FF3B",
    dotInactive: "rgba(255,255,255,0.25)",
  },
  community: {
    cardBg: { sand: "bg-white text-[#111111]", dark: "bg-white text-[#111111]" },
    cardIsDark: { sand: false, dark: false },
    avatarBg: { primary: "bg-[#0037D2] text-white", accent: "bg-[#C1FF3B] text-[#111111]" },
    quoteMark: { sand: "text-[#0037D2]/15", dark: "text-[#0037D2]/15" },
    gridBg: "bg-[#F0EBD8]",
    gridWave: "#F0EBD8",
    emptyText: "text-[#111111]/40",
    featuredBg: "bg-[#0037D2]",
    featuredWave: "#0037D2",
    featuredText: "text-white",
    dotActive: "#C1FF3B",
    dotInactive: "rgba(255,255,255,0.25)",
  },
};

function useTiltSpotlight(maxTilt = 5) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${spotX}% ${spotY}%, rgba(255,255,255,0.14), transparent 70%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rotateY.set((px - 0.5) * maxTilt * 2);
    rotateX.set((0.5 - py) * maxTilt * 2);
    spotX.set(px * 100);
    spotY.set(py * 100);
  };
  const onMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return { ref, rotateX: springX, rotateY: springY, spotlight, onMouseMove, onMouseLeave };
}

function TestimonialCard({ t, tokens, index }: { t: Testimonial; tokens: ThemeTokens; index: number }) {
  const { ref, rotateX, rotateY, spotlight, onMouseMove, onMouseLeave } = useTiltSpotlight();
  const isDark = tokens.cardIsDark[t.cardStyle] ?? false;

  return (
    <motion.figure
      ref={ref}
      variants={cardUp}
      whileHover={{ y: -5, transition: { duration: 0.28, ease: E } }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative mb-5 break-inside-avoid overflow-hidden rounded-3xl border border-black/5 p-8 md:p-9 cursor-default ${tokens.cardBg[t.cardStyle] ?? tokens.cardBg.sand}`}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />
      <div aria-hidden className={`absolute right-6 top-4 font-serif text-7xl leading-none select-none ${tokens.quoteMark[t.cardStyle] ?? tokens.quoteMark.sand}`}>&quot;</div>

      <blockquote className="relative text-balance text-lg font-medium leading-snug">
        <ExpandableQuote
          quote={t.quote}
          name={t.name}
          role={t.role}
          initial={t.initial}
          avatarUrl={t.avatarUrl}
          readMoreClassName={`mt-3 block text-sm font-semibold underline underline-offset-2 opacity-70 transition hover:opacity-100 ${isDark ? "text-white" : ""}`}
        />
      </blockquote>

      <figcaption className="relative mt-8 flex items-center gap-3">
        {t.avatarUrl ? (
          <img src={t.avatarUrl} alt={t.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${tokens.avatarBg[t.avatarStyle] ?? tokens.avatarBg.primary}`}>
            {t.initial}
          </span>
        )}
        <div>
          <div className="text-sm font-semibold">{t.name}</div>
          <div className={`text-xs ${isDark ? "opacity-50" : "opacity-60"}`}>{t.role}</div>
        </div>
      </figcaption>

      <div aria-hidden className={`relative mt-6 text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-white/20" : "opacity-20"}`}>
        #{String(index).padStart(2, "0")}
      </div>
    </motion.figure>
  );
}

function FeaturedTestimonial({ testimonials, tokens }: { testimonials: Testimonial[]; tokens: ThemeTokens }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, [testimonials.length, isPaused]);

  const featured = testimonials[activeIdx];
  if (!featured) return null;

  return (
    <section className={`relative overflow-hidden py-20 lg:py-28 ${tokens.featuredBg}`}>
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
            <blockquote className={`text-balance text-[clamp(1.6rem,3.5vw,2.8rem)] font-bold leading-[1.25] tracking-tight ${tokens.featuredText}`}>
              <ExpandableQuote
                quote={featured.quote}
                name={featured.name}
                role={featured.role}
                initial={featured.initial}
                readMoreClassName="mt-4 block text-base font-semibold text-white/70 underline underline-offset-2 transition hover:text-white"
                onOpenChange={setIsPaused}
                withQuoteMarks={false}
              />
            </blockquote>
            <figcaption className="mt-10 flex items-center gap-4">
              <span className={`grid h-14 w-14 place-items-center rounded-full text-base font-bold ${tokens.avatarBg[featured.avatarStyle] ?? tokens.avatarBg.primary}`}>
                {featured.initial}
              </span>
              <div>
                <div className={`text-base font-semibold ${tokens.featuredText}`}>{featured.name}</div>
                <div className="text-sm text-white/60">{featured.role}</div>
              </div>
            </figcaption>
          </motion.div>
        </AnimatePresence>

        {testimonials.length > 1 && (
          <div className="mt-10 flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === activeIdx ? 28 : 8, background: i === activeIdx ? tokens.dotActive : tokens.dotInactive }}
                aria-label={`View testimonial ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function TestimonialEcosystem({
  testimonials,
  theme,
  emptyMessage,
}: {
  testimonials: Testimonial[];
  theme: Theme;
  emptyMessage: string;
}) {
  const tokens = THEMES[theme];
  const rest = testimonials.slice(1);

  return (
    <>
      {testimonials.length > 0 && (
        <>
          <FeaturedTestimonial testimonials={testimonials} tokens={tokens} />
          <SectionWave from={tokens.featuredWave} to={tokens.gridWave} />
        </>
      )}

      <section className={`${tokens.gridBg} py-24 lg:py-32`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger(0.07)}
            className="columns-1 gap-5 sm:columns-2 lg:columns-3"
          >
            {rest.map((t, i) => (
              <TestimonialCard key={t._id} t={t} tokens={tokens} index={i + 2} />
            ))}
          </motion.div>

          {testimonials.length === 0 && <p className={`py-20 text-center ${tokens.emptyText}`}>{emptyMessage}</p>}
        </div>
      </section>
    </>
  );
}
