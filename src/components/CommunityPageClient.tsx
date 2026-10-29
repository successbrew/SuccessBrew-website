/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { LogoShowcase, type BrandPartner } from "@/components/LogoShowcase";
import { CommunityPartnerGrid } from "@/components/CommunityPartnerGrid";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { WordReveal } from "@/components/WordReveal";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ExpandableQuote } from "@/components/ExpandableQuote";
import type { Testimonial } from "@/components/ServicesPageClient";
import { EVENT_PILLARS } from "@/lib/event-pillars";
import { EventPosterCard } from "@/components/EventPosterCard";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { CursorGlow, StatCard, WhyTimeline, ResourceAccordion, InsideAvatars } from "@/components/community/CommunityMotion";
// NetworkCanvas visualization temporarily removed from this page — component
// file kept intact at @/components/CommunityNetworkCanvas for re-adding later.

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CommunityEvent {
  _id: string;
  tag: string;
  title: string;
  date: string;
  category: string;
  location: string;
  speaker?: string;
  seatsNote?: string;
  registerUrl?: string;
  isFeatured: boolean;
  imageUrl: string;
}

export interface PodcastEpisode {
  _id: string;
  episodeNumber: string;
  duration: string;
  guest: string;
  title: string;
  listenUrl?: string;
  isFeatured: boolean;
  thumbnailUrl?: string;
  speakerId: string | null;
}

export interface CommunityWin {
  _id: string;
  quote: string;
  name: string;
  role: string;
  initial: string;
  cardStyle: "sand" | "blue" | "dark";
  avatarStyle: "blue" | "lime";
}

export interface CommunityPost {
  _id: string;
  name: string;
  role: string;
  initial: string;
  avatarStyle: "blue" | "dark";
  tag: string;
  tagStyle: "lime" | "dark" | "lightBlue";
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

export interface CommunityPageProps {
  events: CommunityEvent[];
  episodes: PodcastEpisode[];
  communityTestimonials: Testimonial[];
  posts: CommunityPost[];
  communityPartners: BrandPartner[];
  communityMembers: BrandPartner[];
  siteSettings: SiteSettings;
}

// ── Animation config ──────────────────────────────────────────────────────────
const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } } };
const cardUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });
// Wins are "dealt" onto the table: each card lands from a slight alternating tilt.
const dealt = {
  hidden: (i: number) => ({ opacity: 0, y: 48, rotate: i % 2 ? 5 : -5, scale: 0.96 }),
  visible: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { type: "spring" as const, stiffness: 140, damping: 18 } },
};

// ── Color maps ────────────────────────────────────────────────────────────────
const winCardBg: Record<string, string> = {
  sand: "bg-[#FFF3D0] text-[#111111]",
  blue: "bg-[linear-gradient(150deg,#003CD1_0%,#0030A8_60%,#0B1640_100%)] text-white",
  dark: "bg-[#111111] text-white",
};
const winAvatarBg: Record<string, string> = {
  blue: "bg-[#003CD1] text-white",
  lime: "bg-[#C6FF3A] text-[#111111]",
  primary: "bg-[#003CD1] text-white",
  accent: "bg-[#C6FF3A] text-[#111111]",
};

// ── Static data (not CMS — product structure) ─────────────────────────────────
const pillars = [
  { num: "01", icon: "💬", title: "Citywise Whatsapp Groups",             badge: "20+ Cities",     tags: ["Local Network", "Daily Chats"], desc: "Hyperlocal WhatsApp groups connecting founders, freelancers and creators in your own city — real conversations, real meetups." },
  { num: "02", icon: "🎙️", title: "The Successbrew Podcast",              badge: "20+ Episodes",  tags: ["Interviews", "Insights"],       desc: "Raw, unfiltered conversations with India's most ambitious founders, investors and creators — no PR filters, no fluff." },
  { num: "03", icon: "🗓️", title: "Community Events",                     badge: "300+ Events",    tags: ["Summits", "Demo Days"],         desc: "High-energy meetups, summits and demo days that turn strangers into co-founders, early customers and collaborators." },
  { num: "04", icon: "📚", title: "Learning Hub for Founders and Teams",  badge: "200+ Resources", tags: ["Playbooks", "Templates"],       desc: "Practical playbooks, templates, ebooks and webinars built specifically for the Indian startup journey." },
  { num: "05", icon: "🤝", title: "Network of Experts",                  badge: "100+ Experts",   tags: ["Operators", "VCs"],             desc: "Direct access to battle-tested operators, VCs, agencies and founders who open doors and challenge your thinking." },
  { num: "06", icon: "🌴", title: "Retreats (Fun, Learning, Wellness)",  badge: "Members Only",   tags: ["Wellness", "Offsites"],         desc: "Curated getaways that blend deep work, wellness and genuine connection — where the best ideas and friendships are born." },
];

const resources = [
  { type: "Blogs",     count: "120+", desc: "Tactical articles on growth, fundraising and product-market fit.",    icon: "📝", bg: "bg-[#003CD1] text-white",    countColor: "text-[#C6FF3A]" },
  { type: "Playbooks", count: "35+",  desc: "Step-by-step frameworks for go-to-market, hiring and content.",       icon: "📖", bg: "bg-[#FFF3D0] text-[#111111]", countColor: "text-[#003CD1]" },
  { type: "Templates", count: "80+",  desc: "Investor decks, SOPs, content calendars — grab and go.",              icon: "📄", bg: "bg-[#FFF3D0] text-[#111111]", countColor: "text-[#003CD1]" },
  { type: "Ebooks",    count: "18+",  desc: "Deep dives from founders who did it and documented it.",               icon: "📘", bg: "bg-[#C6FF3A] text-[#111111]", countColor: "text-[#003CD1]" },
  { type: "Webinars",  count: "60+",  desc: "Recorded sessions with operators, VCs and brand builders.",           icon: "🎥", bg: "bg-[#111111] text-white",      countColor: "text-[#C6FF3A]" },
];

// ── Component ─────────────────────────────────────────────────────────────────
// `posts` stays in the props (the page still fetches it) but the feed section was removed.
export function CommunityPageClient({ events, episodes, communityTestimonials, communityPartners, communityMembers, siteSettings }: CommunityPageProps) {
  const eventPillars = EVENT_PILLARS.map((p) => ({
    ...p,
    count: events.filter((e) => e.category === p.category).length,
  }));
  const featuredEpisode = episodes.find((e) => e.isFeatured) ?? episodes[0];
  const listEpisodes    = episodes.filter((e) => !e.isFeatured).slice(0, 3);
  const previewEpisodes = (featuredEpisode ? [featuredEpisode, ...listEpisodes] : listEpisodes).slice(0, 3);

  return (
    <>
      <NavBar activePage="Community" ctaText="Apply to Join" ctaHref="/apply?source=community" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#F2ECDD] pt-32 pb-16 lg:pt-40 lg:pb-20">
          <AmbientBackground tone="light" noise={false} />
          <CursorGlow />

          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

              {/* LEFT: headline, copy, CTAs */}
              <motion.div initial="hidden" animate="visible" variants={stagger(0.12)}>
                <motion.div variants={fadeUp}
                  className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]/70 backdrop-blur">
                  <span className="h-1.5 w-3 rounded-full bg-gradient-to-r from-primary to-accent" />
                  Successbrew · India's Most Loved Startup Ecosystem
                </motion.div>

                <motion.h1
                  initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                  className="text-balance text-[clamp(2.25rem,4.4vw,4.5rem)] font-black leading-[0.98] tracking-tight text-[#111111]">
                  {["Brew", "Your"].map((word, i) => (
                    <span key={i}>
                      <span className="inline-block overflow-hidden align-top py-[0.2em] -my-[0.2em]">
                        <motion.span className={`inline-block ${word === "Brew" ? "mark-gradient text-[#003CD1]" : ""}`} variants={{ hidden: { y: "110%", opacity: 0 }, visible: { y: "0%", opacity: 1, transition: { duration: 0.65, ease: E } } }}>{word}</motion.span>
                      </span>
                      {i === 0 ? " " : ""}
                    </span>
                  ))}
                  {" "}<span className="relative inline-block">
                    <span className="relative z-10 text-[#111111]">
                      {["Own", "Success."].map((word, i) => (
                        <span key={i}>
                          <span className="inline-block overflow-hidden align-top py-[0.2em] -my-[0.2em]">
                            <motion.span className="inline-block" variants={{ hidden: { y: "110%", opacity: 0 }, visible: { y: "0%", opacity: 1, transition: { duration: 0.65, ease: E } } }}>{word}</motion.span>
                          </span>
                          {i === 0 ? " " : ""}
                        </span>
                      ))}
                    </span>
                    <motion.span aria-hidden
                      variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { delay: 0.55, duration: 0.7, ease: E } } }}
                      className="absolute inset-x-0 bottom-1 -z-0 h-4 origin-left rounded-[2px] bg-gradient-to-r from-accent via-accent to-[#E4FFA8] md:h-6" />
                  </span>
                </motion.h1>

                <motion.p variants={fadeUp} className="mt-8 max-w-xl text-balance text-lg text-[#111111]/70 md:text-xl">
                  8000+ Founders, Freelancers, Agencies, Angels, Creators, and VCs — growing through shared opportunities, real visibility, and meaningful connections across India.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="/apply?source=community" className="glow-blue inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#1F55E8] px-7 py-4 text-base font-semibold text-white transition hover:translate-y-[-2px]">Apply to Join Community</a>
                  <a href="#ecosystem" className="inline-flex items-center gap-2 rounded-full border border-[#111111]/15 bg-white px-7 py-4 text-base font-semibold text-[#111111] transition hover:bg-[#FFF3D0]">Explore Ecosystem</a>
                </motion.div>
              </motion.div>

              {/* RIGHT: community video */}
              <motion.div initial={{ opacity: 0, scale: 0.97, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.85, ease: E }}
                className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#111111]/5 bg-[#111111] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
                <YouTubeEmbed
                  videoId="rFocbWfZe5E"
                  title="See the Successbrew community in action"
                  className="h-full w-full"
                />
              </motion.div>
            </div>

            {/* Stat boxes — centered, below the video */}
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}
              className="mt-12 flex flex-wrap justify-center gap-4">
              {([
                { num: "8000+",  label: "Members",         sub: "Founders · Creators · Investors", bg: "bg-[linear-gradient(150deg,#003CD1_0%,#0030A8_60%,#0B1640_100%)] text-white",     subColor: "text-white/70",     floatDelay: 0   },
                { num: "200K+",  label: "Followers",       sub: "Across social platforms",          bg: "bg-[#FFF3D0] text-[#111111]", subColor: "text-[#111111]/55", floatDelay: 0.6 },
                { num: "200+",   label: "Events Hosted",   sub: "Summits, meetups & workshops",     bg: "bg-[linear-gradient(150deg,#C6FF3A_0%,#DDFF8A_100%)] text-[#111111]", subColor: "text-[#111111]/55", floatDelay: 1.2 },
                { num: "50+",    label: "Brand Partners",  sub: "Collaborations & partnerships",   bg: "bg-[#FFF3D0] text-[#111111]", subColor: "text-[#111111]/55", floatDelay: 1.8 },
                { num: "$8M+",   label: "Impact Created",  sub: "Value unlocked for our community", bg: "bg-[linear-gradient(150deg,#003CD1_0%,#0030A8_60%,#0B1640_100%)] text-white",     subColor: "text-white/70",     floatDelay: 2.4 },
              ] as const).map(({ num, label, sub, bg, subColor }, i) => (
                <StatCard key={label} num={num} label={label} sub={sub} bg={bg} subColor={subColor} index={i} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ TICKER ════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="overflow-hidden bg-[linear-gradient(90deg,#003CD1,#0030A8_50%,#003CD1)] py-3.5 text-white">
          <div className="flex w-max whitespace-nowrap animate-marquee">
            {Array.from({ length: 2 }).map((_, g) => (
              <div key={g} className="flex">
                {["Community", "Content Studio", "Podcast", "Events", "Learning Hub", "Mentor Network", "Visibility", "Momentum", "Belonging", "1M by 2030"].map(item => (
                  <span key={item} className="inline-flex items-center gap-8 px-6 text-[12px] font-semibold uppercase tracking-[0.1em]">
                    {item}<span className="text-accent">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══ ECOSYSTEM ═════════════════════════════════════════════════ */}
        <section id="ecosystem" className="relative overflow-hidden bg-[#FFF3D0] py-16 lg:py-20">
          <AmbientBackground tone="light" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#003CD1]">The Ecosystem</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="6 Pillars of Successbrew Ecosystem" /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="#cta" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#111111] underline-offset-4 hover:underline">
                Join the ecosystem
              </motion.a>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {pillars.map((p) => (
                <motion.article key={p.num} variants={cardUp} whileHover={{ y: -2, transition: { duration: 0.3, ease: E } }}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#111111]/5 bg-white p-8 hover:shadow-[0_30px_60px_-30px_rgba(0,52,180,0.55)] md:p-10">
                  {/* Hover "pours" the card full of blue from the bottom edge. */}
                  <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-[linear-gradient(160deg,#003CD1_0%,#0030A8_60%,#0B1640_100%)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                  <span aria-hidden className="pointer-events-none absolute -right-3 -top-8 select-none text-[9rem] font-black leading-none tracking-tighter text-[#111111]/[0.04] transition-colors duration-500 group-hover:text-white/[0.08]">{p.num}</span>
                  <div className="relative">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]/40 transition-colors duration-500 group-hover:text-white/60">
                      <span>{p.num}</span>
                      <span aria-hidden className="h-2 w-2 rounded-full bg-[#C6FF3A] transition-transform duration-500 group-hover:scale-150" />
                    </div>
                    <div className="mt-6 inline-block text-3xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-12 group-hover:scale-125">{p.icon}</div>
                    <h3 className="mt-4 text-2xl font-extrabold tracking-tight transition-colors duration-500 group-hover:text-white md:text-3xl">{p.title}</h3>
                    <p className="mt-4 text-[#111111]/60 transition-colors duration-500 group-hover:text-white/75">{p.desc}</p>
                  </div>
                  <div className="relative mt-8 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {p.tags.map(t => <span key={t} className="rounded-full bg-[#FFF3D0] px-3 py-1 text-xs font-semibold text-[#111111]/70 transition-colors duration-500 group-hover:bg-white/10 group-hover:text-white">{t}</span>)}
                    </div>
                    <span className="rounded-full bg-[#003CD1]/8 px-3 py-1 text-[11px] font-bold text-[#003CD1] transition-colors duration-500 group-hover:bg-[#C6FF3A] group-hover:text-[#111111]">{p.badge}</span>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <CommunityPartnerGrid partners={communityPartners} />
        <LogoShowcase
          brandPartners={communityMembers}
          eyebrow="Who's Inside"
          heading="Community Members From"
          alwaysColor
          sectionBg="bg-[#FFF3D0]"
        />

        {/* ══ OUR WHY ═══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#003CD1_0%,#002A93_55%,#0B1640_100%)] py-16 text-white lg:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-accent/20 blur-[130px]" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}>
                <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">Our Why</motion.p>
                <h2 className="mt-3 text-balance text-[clamp(2.6rem,5vw,5rem)] font-black leading-[0.95] tracking-tight">
                  <WordReveal text="Talent is everywhere." />{" "}<br />
                  <span className="text-gradient-lime"><WordReveal text="Opportunity is not." /></span>
                </h2>
                <motion.p variants={fadeUp} className="mt-6 max-w-xl text-balance text-lg text-white/75">
                  Most ambitious Indians never get the room, the mentor, or the mic. Successbrew exists to close that gap — not by replacing hard work, but by amplifying it with access, visibility and a community that actually shows up.
                </motion.p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease: E }} className="relative">
                <div className="aspect-square overflow-hidden rounded-[2rem] border border-white/10">
                  <img src="/grid-images/our-why-founder.jpg" alt="Successbrew founder" className="h-full w-full object-cover object-[44%_center]" />
                </div>
                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6, ease: E }}
                  className="absolute -bottom-5 left-6 rounded-2xl bg-[#C6FF3A] px-6 py-4 text-[#111111] shadow-lg">
                  <div className="text-2xl font-black">1M</div>
                  <div className="text-xs font-medium text-black/60">Entrepreneurs · Vision 2030</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Timeline — full section width, below the text/picture row */}
            <div className="mt-20">
              <WhyTimeline steps={[["2018", "Founded"], ["2023", "8K+"], ["2024", "200 Events"], ["2025", "150K"], ["2030", "1M 🎯"]]} />
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.12)}
              className="mt-20 grid gap-6 md:grid-cols-3">
              {[
                { label: "Access",     value: "The room. The mentor. The mic.", desc: "Members get intros, speaking slots and investment conversations they couldn't manufacture alone." },
                { label: "Visibility", value: "150K eyes. Every month.",        desc: "Studio, podcast and community put your story in front of the right people at the right moment." },
                { label: "Momentum",   value: "From idea to traction.",         desc: "Playbooks, cohorts and accountability structures that compress years of learning into months." },
              ].map(({ label, value, desc }) => (
                <motion.div key={label} variants={cardUp} className="edge-gradient overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#C6FF3A]">{label}</p>
                  <p className="mt-2 text-lg font-black text-white">{value}</p>
                  <p className="mt-3 text-sm leading-7 text-white/60">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ WINS (CMS) ════════════════════════════════════════════════ */}
        <section id="wins" className="bg-[#F2ECDD] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#003CD1]">Community Wins</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Success stories brewed here." /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="/community/testimonials" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#111111] underline-offset-4 hover:underline">
                Read all community stories
              </motion.a>
            </motion.div>
            {communityTestimonials.length > 0 ? (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.11)}
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {communityTestimonials.slice(0, 6).map((t, i) => (
                  <motion.figure key={t._id} custom={i} variants={dealt} whileHover={{ y: -2, transition: { duration: 0.3, ease: E } }}
                    className={`flex h-full flex-col justify-between rounded-3xl border border-[#111111]/5 p-8 md:p-10 ${winCardBg[t.cardStyle] ?? winCardBg.sand}`}>
                    <blockquote className="text-balance text-lg font-medium leading-snug">
                      <ExpandableQuote
                        quote={t.quote}
                        name={t.name}
                        role={t.role}
                        initial={t.initial}
                        avatarUrl={t.avatarUrl}
                        readMoreClassName={`mt-3 block text-sm font-semibold underline underline-offset-4 opacity-70 transition hover:opacity-100 ${t.cardStyle === "dark" ? "text-white" : ""}`}
                      />
                    </blockquote>
                    <figcaption className="mt-10 flex items-center gap-4">
                      {t.avatarUrl ? (
                        <img src={t.avatarUrl} alt={t.name} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold ${winAvatarBg[t.avatarStyle] ?? winAvatarBg.blue}`}>{t.initial}</span>
                      )}
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="mt-0.5 text-xs opacity-60">{t.role}</div>
                      </div>
                    </figcaption>
                  </motion.figure>
                ))}
              </motion.div>
            ) : (
              <p className="text-sm text-[#111111]/50">No community stories yet — add them in /sbh-1111/testimonials.</p>
            )}
          </div>
        </section>

        {/* ══ EVENTS (CMS) ══════════════════════════════════════════════ */}
        <section id="events" className="relative overflow-hidden bg-[#FFF3D0] py-16 lg:py-20">
          <AmbientBackground tone="light" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#003CD1]">Four Rooms, One Ecosystem</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Be in the room where it happens." /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="/community/events" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#111111] underline-offset-4 hover:underline">
                All events
              </motion.a>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {eventPillars.map((p) => (
                <EventPosterCard key={p.slug} pillar={p} count={p.count} />
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 rounded-2xl border border-dashed border-[#003CD1]/30 bg-[#003CD1]/5 p-6 text-center">
              <p className="text-sm font-bold text-[#003CD1]">200+ events hosted across India</p>
              <p className="mt-1 text-xs text-[#111111]/50">Mumbai · Delhi · Bengaluru · Hyderabad · Pune</p>
            </motion.div>
          </div>
        </section>

        {/* ══ PODCAST (CMS) ═════════════════════════════════════════════ */}
        <section id="podcast" className="bg-[#F2ECDD] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#003CD1]">Successbrew Podcast</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Real talk. Real founders." /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="/community/podcast" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#111111] underline-offset-4 hover:underline">
                All Episodes
              </motion.a>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {previewEpisodes.map((ep) => (
                <motion.div key={ep._id} variants={cardUp} whileHover={{ y: -2, transition: { duration: 0.3, ease: E } }}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#111111]/5 bg-white shadow-[0_8px_24px_-16px_rgba(0,0,0,0.15)] transition-shadow hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
                  <a href={ep.listenUrl ?? "#"} className="relative block aspect-video w-full overflow-hidden">
                    <img src={ep.thumbnailUrl ?? "/grid-images/IMG20241127141737.jpg"} alt={ep.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    {ep.isFeatured && (
                      <span className="absolute left-3 top-3 rounded-full bg-[#C6FF3A] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#111111]">Featured</span>
                    )}
                    <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-[#C6FF3A] text-[#111111] shadow-lg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                      <p className="text-xs font-bold text-white/80">{ep.episodeNumber} · {ep.duration}</p>
                      <span aria-hidden className="flex h-4 items-end gap-[3px]">
                        {[0, 0.25, 0.5, 0.15, 0.4].map((d, i) => (
                          <span key={i} className="eq-bar h-full w-[3px] rounded-full bg-[#C6FF3A]" style={{ animationDelay: `${-d}s` }} />
                        ))}
                      </span>
                    </div>
                  </a>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <a href={ep.listenUrl ?? "#"}>
                        <h3 className="text-lg font-black leading-snug text-[#111111] group-hover:text-[#003CD1]">{ep.title}</h3>
                      </a>
                      <p className="mt-1.5 text-xs text-[#111111]/50">{ep.guest}</p>
                    </div>
                    <a href={ep.listenUrl ?? "#"} className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-[#111111] group-hover:text-[#003CD1]">
                      Listen now →
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 rounded-2xl border border-[#111111]/5 bg-white p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]/45">100+ Episodes · 60+ Guests</p>
              <a href="/community/podcast" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#003CD1] hover:underline">All Episodes →</a>
            </motion.div>
          </div>
        </section>

        {/* ══ LEARNING HUB ══════════════════════════════════════════════ */}
        <section id="learning-hub" className="bg-[#F2ECDD] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-8">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#003CD1]">Learning Hub</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="200+ resources built for builders." /></h2>
              </motion.div>
            </motion.div>
            <ResourceAccordion resources={resources} />
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section id="cta" className="relative overflow-hidden bg-[#111111] text-white">
          <AmbientBackground tone="dark" />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.14)}
            className="relative mx-auto max-w-7xl px-6 py-28 text-center lg:px-10 lg:py-40">
            <InsideAvatars people={communityTestimonials} />
            <motion.p variants={fadeUp} className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-white/50">8,000+ already inside</motion.p>
            <motion.h2 variants={fadeUp} className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">
              Ready to <span className="mark-gradient">Brew</span> <span className="text-gradient-lime">Yours?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-xl text-lg text-white/60">
              Join a community of founders, creators and students building India's next decade — together.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <a href="/apply?source=community" className="glow-lime inline-flex items-center gap-2 rounded-full bg-[#C6FF3A] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px] hover:bg-[#B5EB2A]">Apply to Join Community</a>
              <a href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">Our Story</a>
            </motion.div>
          </motion.div>
        </section>

        <Footer siteSettings={siteSettings} />

      </main>
    </>
  );
}
