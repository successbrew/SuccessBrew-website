"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";
import { WordReveal } from "@/components/WordReveal";
import type { Service } from "@/components/ServicesPageClient";

const E = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 420, damping: 36 } as const;

/** Services with their own landing page, keyed by normalised title. */
const SERVICE_PAGES: Record<string, string> = {
  "founder led growth": "/personal-branding",
};
const servicePageFor = (title: string) => SERVICE_PAGES[title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()];

/**
 * "What we do" as an explorer: pick a service on the left (a highlight slides
 * between rows), its full brief swaps in on the right with its deliverables
 * staggering in. Below `lg` the same list becomes an accordion.
 * Keyboard: the list is a tablist — ↑/↓ (or ←/→), Home and End move between services.
 */
export function ServiceExplorer({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  // Mobile only: tapping the open row folds it away again.
  const [mobileOpen, setMobileOpen] = useState(true);
  const reduced = useReducedMotion();
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (services.length === 0) return null;
  const current = services[Math.min(active, services.length - 1)];

  function select(i: number) {
    const next = (i + services.length) % services.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const moves: Record<string, number> = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: services.length - 1 };
    if (e.key in moves) {
      e.preventDefault();
      select(moves[e.key]);
    }
  }

  return (
    <section id="services" className="bg-sand py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
          <div>
            <motion.p variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } } }}
              className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">What we do</motion.p>
            <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl">
              <WordReveal text="Everything your launch needs." />{" "}
              <span className="mark-gradient"><WordReveal text="In one place." /></span>
            </h2>
          </div>
          <motion.p variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } } }}
            className="max-w-xs text-sm text-ink/55">
            From launch brief to lasting attention. Pick a service to see what&rsquo;s included.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:gap-12">
          {/* ── Service list (tabs on desktop, accordion on mobile) ── */}
          <div role="tablist" aria-orientation="vertical" aria-label="Services" onKeyDown={onKeyDown} className="flex flex-col gap-1.5">
            {services.map((svc, i) => {
              const selected = i === active;
              return (
                <div key={svc._id}>
                  <motion.button
                    ref={(el) => { tabRefs.current[i] = el; }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${i}`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={selected ? 0 : -1}
                    aria-expanded={selected && mobileOpen}
                    onClick={() => {
                      if (selected) setMobileOpen((o) => !o);
                      else { setActive(i); setMobileOpen(true); }
                    }}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, ease: E, delay: i * 0.05 }}
                    whileTap={{ scale: 0.99 }}
                    className="group relative flex w-full items-center gap-5 rounded-xl px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary md:px-6 md:py-5"
                  >
                    {selected && (
                      <motion.span
                        layoutId={reduced ? undefined : "service-highlight"}
                        transition={SPRING}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-xl border border-ink/10 bg-background shadow-[0_18px_40px_-24px_rgba(17,17,17,0.35)]"
                      />
                    )}
                    <span className={`relative text-sm font-semibold tabular-nums transition-colors duration-200 ${selected ? "text-primary" : "text-ink/35 group-hover:text-ink/60"}`}>
                      {svc.num}
                    </span>
                    <span className={`relative flex-1 text-lg font-extrabold tracking-tight transition-colors duration-200 md:text-xl ${selected ? "text-ink" : "text-ink/55 group-hover:text-ink"}`}>
                      {svc.title}
                    </span>
                    <motion.span
                      aria-hidden="true"
                      animate={{ x: selected ? 0 : -6, opacity: selected ? 1 : 0 }}
                      transition={{ duration: 0.25, ease: E }}
                      className="relative hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-white lg:grid"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </motion.span>
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: selected && mobileOpen ? 45 : 0 }}
                      transition={SPRING}
                      className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/60 lg:hidden"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                    </motion.span>
                  </motion.button>

                  {/* Mobile: the brief opens under its row. */}
                  <AnimatePresence initial={false}>
                    {selected && mobileOpen && (
                      <motion.div
                        key="accordion"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.35, ease: E }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="px-5 pb-6 pt-2">
                          <ServiceBrief svc={svc} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* ── Desktop panel ── */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <MagicCard className="shadow-[0_40px_80px_-40px_rgba(17,17,17,0.3)]" gradientSize={320}>
                <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} className="relative min-h-[520px] overflow-hidden p-10 xl:p-12">
                  {/* Oversized number watermark, crossfading with the service. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={current._id}
                      aria-hidden="true"
                      initial={{ opacity: 0, y: reduced ? 0 : 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduced ? 0 : -40 }}
                      transition={{ duration: 0.5, ease: E }}
                      className="pointer-events-none absolute -bottom-10 right-6 select-none bg-gradient-to-b from-primary/12 to-accent/5 bg-clip-text text-[12rem] font-semibold leading-none tracking-tighter text-transparent"
                    >
                      {current.num}
                    </motion.span>
                  </AnimatePresence>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={current._id}
                      initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduced ? 0 : -10 }}
                      transition={{ duration: 0.3, ease: E }}
                      className="relative"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                        Service {current.num} <span className="text-ink/30">/ {String(services.length).padStart(2, "0")}</span>
                      </p>
                      <h3 className="mt-4 max-w-md text-4xl font-extrabold tracking-tight">{current.title}</h3>
                      <ServiceBrief svc={current} large />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </MagicCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A service's description, deliverables (staggered in) and next step. */
function ServiceBrief({ svc, large = false }: { svc: Service; large?: boolean }) {
  const href = servicePageFor(svc.title);
  return (
    <>
      <p className={large ? "mt-4 max-w-lg text-lg text-ink/60" : "text-ink/60"}>{svc.description}</p>
      {svc.tags?.length > 0 && (
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
          className={`grid gap-x-8 gap-y-3 ${large ? "mt-10 xl:grid-cols-2" : "mt-6"}`}
        >
          {svc.tags.map((t) => (
            <motion.li
              key={t}
              variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: E } } }}
              className="flex gap-3 text-sm text-ink/75"
            >
              <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/60 text-ink">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              {t}
            </motion.li>
          ))}
        </motion.ul>
      )}
      <div className={large ? "mt-12" : "mt-6"}>
        {href ? (
          <Link href={href} className="group/cta inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary">
            Explore {svc.title}
            <span aria-hidden="true" className="transition-transform duration-200 group-hover/cta:translate-x-1">→</span>
          </Link>
        ) : (
          <a href="#cta" className="group/cta inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary">
            Discuss this service
            <span aria-hidden="true" className="transition-transform duration-200 group-hover/cta:translate-x-1">→</span>
          </a>
        )}
      </div>
    </>
  );
}
