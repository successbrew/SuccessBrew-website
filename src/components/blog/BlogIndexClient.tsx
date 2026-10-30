"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import type { SiteSettings } from "@/components/SocialLinks";
import { BLOG_PATH, type PostCard, type TagCount } from "@/lib/blog-format";
import { FeaturedPostCard, PostCardView, TagChip } from "@/components/blog/PostCard";
import { CursorGlow } from "@/components/community/CommunityMotion";
import { AnimatedNumber } from "@/components/AnimatedNumber";

const E = [0.22, 1, 0.36, 1] as const;

interface Props {
  posts: PostCard[];
  tags: TagCount[];
  siteSettings: SiteSettings;
  /** Set on a tag page: the listing is already filtered to this tag. */
  activeTag?: TagCount | { name: string; slug: string; description: string | null; count: number };
}

/** Shared view for the blog index and its tag pages: hero, tag rail, instant search,
 * newest post featured, the rest in a grid. */
export function BlogIndexClient({ posts, tags, siteSettings, activeTag }: Props) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const countsRef = useRef<HTMLDivElement>(null);
  const countsInView = useInView(countsRef, { once: true });
  // Headline lines rise out of a mask one after another.
  const rise = (i: number) => ({
    initial: reduced ? false : { y: "105%" },
    animate: { y: "0%" },
    transition: { duration: 0.85, delay: 0.08 + i * 0.12, ease: E },
  } as const);
  const q = query.trim().toLowerCase();

  const shown = useMemo(() => {
    if (!q) return posts;
    return posts.filter((p) =>
      [p.title, p.excerpt ?? "", ...p.tags.map((t) => t.name)].some((s) => s.toLowerCase().includes(q))
    );
  }, [posts, q]);

  const [featured, ...rest] = shown;
  const showFeatured = !q && !activeTag && featured;
  const grid = showFeatured ? rest : shown;

  return (
    <>
      <NavBar activePage="Blog" ctaText="Apply to Join" ctaHref="/apply?source=blog" />
      <main className="min-h-screen bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-32 pb-10 lg:pt-40 lg:pb-14">
          <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#C6FF3A]/30 blur-[120px]" />
          <CursorGlow />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Link href={activeTag ? BLOG_PATH : "/community"} className="text-xs font-semibold uppercase tracking-[0.12em] text-[#111111]/50 hover:text-[#003CD1]">
              ← {activeTag ? "All posts" : "Community"}
            </Link>
            <motion.p initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: E }}
              className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#003CD1]">
              {activeTag ? `Tag · ${activeTag.count} post${activeTag.count === 1 ? "" : "s"}` : "The Successbrew Blog"}
            </motion.p>
            <h1 className="mt-4 max-w-4xl text-[clamp(2.75rem,7vw,6rem)] font-black leading-[0.95] tracking-tight">
              {(activeTag ? [activeTag.name] : ["Ideas worth", "brewing."]).map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.1em]">
                  <motion.span {...rise(i)} className={`block ${!activeTag && i === 1 ? "w-fit" : ""}`}>
                    {!activeTag && i === 1 ? <span className="mark-gradient text-[#003CD1]">{line}</span> : line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12, ease: E }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-[#111111]/65">
              {activeTag
                ? activeTag.description || `Everything we've written on ${activeTag.name.toLowerCase()} — playbooks, stories and lessons from the Successbrew community.`
                : "Playbooks, founder stories and hard-won lessons from India's startup community — written by the people building it."}
            </motion.p>

            {posts.length > 0 && !activeTag && (
              <motion.div ref={countsRef} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-8 flex gap-10">
                {[{ v: posts.length, l: posts.length === 1 ? "Post" : "Posts" }, { v: tags.length, l: tags.length === 1 ? "Topic" : "Topics" }].map((s) => (
                  <div key={s.l}>
                    <p className="text-4xl font-black tabular-nums tracking-tight text-[#003CD1]"><AnimatedNumber value={String(s.v)} inView={countsInView} /></p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111111]/50">{s.l}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {posts.length > 0 && (
              <div className="relative mt-10 max-w-xl">
                <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/40" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder={activeTag ? `Search ${activeTag.name} posts` : "Search posts and topics"} aria-label="Search posts"
                  className="h-12 w-full rounded-full border border-[#111111]/12 bg-white pl-11 pr-11 text-[15px] outline-none transition focus:border-[#003CD1] focus:ring-4 focus:ring-[#003CD1]/10" />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search"
                    className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#111111]/50 hover:bg-[#111111]/5">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ══ TAG RAIL ═══════════════════════════════════════════════════ */}
        {tags.length > 0 && (
          <div className="sticky top-16 z-20 border-y border-[#111111]/8 bg-[#F2ECDD]/90 backdrop-blur-md">
            <div className="hide-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3 lg:px-10">
              <Link href={BLOG_PATH} aria-current={!activeTag ? "page" : undefined}
                className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${!activeTag ? "border-[#111111] bg-[#111111] text-white" : "border-[#111111]/12 bg-white text-[#111111]/70 hover:text-[#111111]"}`}>
                All posts
              </Link>
              {tags.map((t) => <TagChip key={t.slug} name={t.name} slug={t.slug} count={t.count} active={activeTag?.slug === t.slug} />)}
            </div>
          </div>
        )}

        {/* ══ POSTS ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            {posts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#111111]/15 bg-white/60 px-6 py-20 text-center">
                <p className="text-2xl font-black tracking-tight">The first posts are brewing.</p>
                <p className="mx-auto mt-3 max-w-md text-[#111111]/60">Check back soon — or join the community to hear when they land.</p>
                <Link href="/community" className="mt-8 inline-flex rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#003CD1]">Explore the community</Link>
              </div>
            ) : shown.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xl font-black">Nothing matches &ldquo;{query}&rdquo;.</p>
                <button type="button" onClick={() => setQuery("")} className="mt-4 text-sm font-semibold text-[#003CD1] hover:underline">Clear search</button>
              </div>
            ) : (
              <>
                {showFeatured && <div className="mb-14"><FeaturedPostCard post={featured} /></div>}
                {q && <p className="mb-8 text-sm font-semibold text-[#111111]/50">{shown.length} result{shown.length === 1 ? "" : "s"}</p>}
                <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {grid.map((p, i) => (
                    <motion.div key={p.id} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: Math.min(i % 3, 2) * 0.06, ease: E }}>
                      <PostCardView post={p} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ══ CTA ════════════════════════════════════════════════════════ */}
        <section className="bg-[#111111] py-20 text-white lg:py-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C6FF3A]">Read it. Then live it.</p>
              <h2 className="mt-4 max-w-2xl text-balance text-4xl font-black leading-[1] tracking-tight md:text-6xl">The best ideas are argued over in the room.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/apply?source=blog" className="rounded-full bg-[#C6FF3A] px-7 py-4 text-sm font-bold text-[#111111] transition hover:translate-y-[-2px]">Join the Community</Link>
              <Link href="/community/events" className="rounded-full border border-white/25 px-7 py-4 text-sm font-semibold transition hover:bg-white/10">See upcoming events</Link>
            </div>
          </div>
        </section>

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
