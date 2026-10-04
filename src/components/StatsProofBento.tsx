"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ViewsGrowthChart } from "@/components/ViewsGrowthChart";
import { VIEWS_GROWTH } from "@/lib/content/views-growth";
import type { BrandPartner } from "@/components/LogoShowcase";
import type { CaseStudy, Stat, Testimonial } from "@/components/ServicesPageClient";

const E = [0.22, 1, 0.36, 1] as const;

/**
 * "By the numbers" as a bento of proof: every stat sits next to evidence pulled
 * from the site's own data — the case studies behind the views, client logos,
 * a real testimonial — so the numbers read as results, not claims.
 *
 * Stats are admin-managed, so each one is matched to its proof by its label;
 * anything unrecognised still renders as a clean number-only tile.
 */
type ProofKind = "views" | "launches" | "clients" | "voices" | "plain";

function proofKindFor(label: string): ProofKind {
  const l = label.toLowerCase();
  if (/view|impression|reach/.test(l)) return "views";
  if (/product of the day|product hunt|launch/.test(l)) return "launches";
  if (/client|partner|brand/.test(l)) return "clients";
  if (/testimonial|review|voice/.test(l)) return "voices";
  return "plain";
}

/** "20+" → 20, "8,000+" → 8000, "100M+" → 100000000; null if not a plain count. */
function parseCount(value: string): number | null {
  const m = value.match(/^([\d,]+)([KMkm]?)\+?$/);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ""), 10);
  const mult = m[2] ? (m[2].toLowerCase() === "k" ? 1_000 : 1_000_000) : 1;
  return n * mult;
}

const TILE_TONE: Record<Stat["colorScheme"], { tile: string; label: string; muted: string }> = {
  default: { tile: "border-ink/10 bg-background text-ink", label: "text-ink/60", muted: "text-ink/45" },
  primary: { tile: "border-primary bg-[linear-gradient(150deg,#003CD1_0%,#0030A8_60%,#0B1640_100%)] text-white", label: "text-white/75", muted: "text-white/60" },
  accent: { tile: "border-accent bg-[linear-gradient(150deg,#C6FF3A_0%,#DDFF8A_100%)] text-ink", label: "text-ink/70", muted: "text-ink/55" },
};

const WIDE_KINDS = new Set<ProofKind>(["views"]);

/** Column spans so the grid never leaves an empty cell: wide kinds take two
 * columns, and the last tile stretches to fill whatever its row has left. */
function spansFor(kinds: ProofKind[]) {
  const spans = kinds.map((k) => ({ sm: WIDE_KINDS.has(k) ? 2 : 1, lg: WIDE_KINDS.has(k) ? 2 : 1 }));
  const fill = (key: "sm" | "lg", cols: number) => {
    const used = spans.reduce((sum, s) => sum + s[key], 0);
    const gap = (cols - (used % cols)) % cols;
    if (gap && spans.length) spans[spans.length - 1][key] = Math.min(cols, spans[spans.length - 1][key] + gap);
  };
  fill("sm", 2);
  fill("lg", 3);
  return spans.map((s) => `${s.sm === 2 ? "sm:col-span-2" : ""} ${s.lg === 3 ? "lg:col-span-3" : s.lg === 2 ? "lg:col-span-2" : "lg:col-span-1"}`);
}

export function StatsProofBento({
  stats,
  brandPartners,
  testimonials,
  caseStudies,
  inView,
}: {
  stats: Stat[];
  brandPartners: BrandPartner[];
  testimonials: Testimonial[];
  caseStudies: CaseStudy[];
  inView: boolean;
}) {
  if (stats.length === 0) return null;
  const kinds = stats.map((s) => proofKindFor(s.label));
  const spans = spansFor(kinds);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s, i) => {
        const kind = kinds[i];
        const tone = TILE_TONE[s.colorScheme] ?? TILE_TONE.default;
        return (
          <motion.div
            key={s._id}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: E, delay: i * 0.08 }}
            className={`flex min-h-[260px] flex-col rounded-xl border p-6 md:p-8 ${tone.tile} ${spans[i]}`}
          >
            <div className="text-[clamp(2.25rem,4vw,3.5rem)] font-black leading-none tracking-tight">
              <AnimatedNumber value={s.number} inView={inView} />
            </div>
            <div className={`mt-2 text-sm ${tone.label}`}>{s.label}</div>

            <div className="mt-auto pt-8">
              {kind === "views" && <ViewsProof caseStudies={caseStudies} mutedClass={tone.muted} inView={inView} />}
              {kind === "launches" && <LaunchesProof stat={s} inView={inView} mutedClass={tone.muted} />}
              {kind === "clients" && <ClientsProof partners={brandPartners} />}
              {kind === "voices" && <VoicesProof testimonials={testimonials} mutedClass={tone.muted} />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/** The views growth chart once its data is filled in (src/lib/content/views-growth.ts);
 * until then, the real case studies behind the views, each linking through. */
function ViewsProof({ caseStudies, mutedClass, inView }: { caseStudies: CaseStudy[]; mutedClass: string; inView: boolean }) {
  if (VIEWS_GROWTH.length >= 4) {
    return (
      <div>
        <ViewsGrowthChart data={VIEWS_GROWTH} inView={inView} />
        <div className="mt-6 flex justify-end border-t border-ink/10 pt-4">
          <Link href="/case-studies" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">See the case studies behind the views →</Link>
        </div>
      </div>
    );
  }
  const shown = caseStudies.slice(0, 3);
  if (shown.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${mutedClass}`}>Behind the views</p>
        <Link href="/case-studies" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">All case studies →</Link>
      </div>
      <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
        {shown.map((c) => (
          <li key={c._id}>
            <Link href={`/case-studies/${c._id}`} className="group flex items-center justify-between gap-4 py-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{c.clientName || c.title}</span>
                <span className={`block truncate text-xs ${mutedClass}`}>{c.clientName ? c.title : c.tag}</span>
              </span>
              <svg className="shrink-0 text-ink/30 transition-colors group-hover:text-primary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One "#1" medal per Product of the Day finish, filling in on scroll. */
function LaunchesProof({ stat, inView, mutedClass }: { stat: Stat; inView: boolean; mutedClass: string }) {
  const total = parseCount(stat.number);
  const medals = total ? Math.min(30, Math.max(1, total)) : 20;
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: medals }, (_, i) => (
          <motion.span
            key={i}
            className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[10px] font-semibold text-accent"
            initial={{ opacity: 0.15 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.25, delay: 0.4 + i * 0.04 }}
          >
            #1
          </motion.span>
        ))}
      </div>
      <p className={`mt-3 text-xs ${mutedClass}`}>One medal for every #1 Product of the Day on Product Hunt.</p>
    </div>
  );
}

function ClientsProof({ partners }: { partners: BrandPartner[] }) {
  const shown = partners.filter((p) => p.logoUrl).slice(0, 6);
  if (shown.length === 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2">
      {shown.map((p) => (
        <div key={p._id} className="grid h-14 place-items-center rounded-lg border border-ink/10 bg-white p-2">
          <img src={p.logoUrl} alt={p.name} className="max-h-8 w-auto max-w-full object-contain opacity-80 grayscale" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function VoicesProof({ testimonials, mutedClass }: { testimonials: Testimonial[]; mutedClass: string }) {
  // Prefer a short quote so it reads in full inside the tile.
  const t = [...testimonials].sort((a, b) => a.quote.length - b.quote.length).find((x) => x.quote.length >= 40) ?? testimonials[0];
  if (!t) return null;
  return (
    <figure>
      <blockquote className="line-clamp-4 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
      <figcaption className={`mt-3 flex items-center justify-between gap-3 text-xs ${mutedClass}`}>
        <span>
          <span className="font-semibold">{t.name}</span>
          {t.role ? ` · ${t.role}` : ""}
        </span>
        <Link href="/testimonials" className="shrink-0 font-semibold underline-offset-4 hover:underline">Read all →</Link>
      </figcaption>
    </figure>
  );
}
