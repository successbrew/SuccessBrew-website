/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import type { SiteSettings } from "@/components/SocialLinks";
import { WordReveal } from "@/components/WordReveal";
import { SectionWave } from "@/components/SectionWave";
import type { PodcastEpisode } from "@/components/CommunityPageClient";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } } };
const cardUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

interface Props {
  episodes: PodcastEpisode[];
  siteSettings: SiteSettings;
}

export function CommunityPodcastPageClient({ episodes, siteSettings }: Props) {
  return (
    <>
      <NavBar activePage="Community" ctaText="Join Community" ctaHref="/apply" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#F2ECDD] pt-32 pb-16 lg:pt-44 lg:pb-24">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-[#0037D2]/15 blur-3xl" />
            <div className="absolute right-[-100px] bottom-0 h-[380px] w-[380px] rounded-full bg-[#C1FF3B]/30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.11)}>
              <motion.a variants={fadeUp} href="/community"
                className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]/50 hover:text-[#0037D2]">
                ← Back to Community
              </motion.a>
              <motion.div variants={fadeUp}
                className="mb-8 flex w-fit items-center gap-2 rounded-full border border-[#111111]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0037D2]" />
                {episodes.length} episode{episodes.length !== 1 ? "s" : ""} and counting
              </motion.div>

              <h1 className="text-balance text-[clamp(2.75rem,7vw,6rem)] font-black leading-[0.95] tracking-tight text-[#111111]">
                <WordReveal text="Real talk." mode="nested" staggerDelay={0.06} />
                {" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#0037D2]"><WordReveal text="Real founders." mode="nested" staggerDelay={0.06} /></span>
                  <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-[#C1FF3B] md:h-6" />
                </span>
              </h1>

              <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg text-[#111111]/60 md:text-xl">
                Every episode of the Successbrew Podcast — unfiltered conversations with founders, investors and creators.
              </motion.p>
            </motion.div>
          </div>
        </section>
        <SectionWave from="#F2ECDD" to="#F0EBD8" />

        {/* ══ EPISODES GRID ═════════════════════════════════════════════ */}
        <section className="bg-[#F0EBD8] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            {episodes.length > 0 ? (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.07)}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {episodes.map((ep) => (
                  <motion.div key={ep._id} variants={cardUp} whileHover={{ y: -6, transition: { duration: 0.3, ease: E } }}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#111111]/5 bg-white shadow-[0_8px_24px_-16px_rgba(0,0,0,0.15)] transition-shadow hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
                    <a href={ep.listenUrl ?? "#"} className="relative block aspect-video w-full overflow-hidden">
                      <img src={ep.thumbnailUrl ?? "/grid-images/IMG20241127141737.jpg"} alt={ep.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      {ep.isFeatured && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#C1FF3B] px-2.5 py-1 text-[10px] font-black uppercase text-[#111111]">Featured</span>
                      )}
                      <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#C1FF3B] text-[#111111] shadow-lg">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-xs font-bold text-white/80">{ep.episodeNumber} · {ep.duration}</p>
                      </div>
                    </a>
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <a href={ep.listenUrl ?? "#"}>
                          <h3 className="text-lg font-black leading-snug text-[#111111] group-hover:text-[#0037D2]">{ep.title}</h3>
                        </a>
                        <p className="mt-1.5 text-xs text-[#111111]/50">{ep.guest}</p>
                      </div>
                      <a href={ep.listenUrl ?? "#"} className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-[#111111] group-hover:text-[#0037D2]">
                        Listen now →
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-sm text-[#111111]/50">No episodes published yet — add them in /sbh-1111/podcast-episodes.</p>
            )}
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <SectionWave from="#F0EBD8" to="#0037D2" />
        <section id="cta" className="bg-[#0037D2] py-24 text-white lg:py-32">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger(0.12)}
            className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">Never miss an episode</motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 text-balance text-4xl font-black tracking-tight md:text-6xl">Join the community.</motion.h2>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href="/apply" className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
                Join Community
              </a>
              <a href="/community" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                Explore Ecosystem
              </a>
            </motion.div>
          </motion.div>
        </section>
        <SectionWave from="#0037D2" to="var(--ink)" />

        <Footer siteSettings={siteSettings} />

      </main>
    </>
  );
}
