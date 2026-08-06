/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import { LogoShowcase, type BrandPartner } from "@/components/LogoShowcase";
import { CommunityPartnerGrid } from "@/components/CommunityPartnerGrid";
import { CommunityMapBackground } from "@/components/CommunityMapBackground";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { WordReveal } from "@/components/WordReveal";
import { AmbientBackground } from "@/components/AmbientBackground";
import { SectionWave } from "@/components/SectionWave";
import { ExpandableQuote } from "@/components/ExpandableQuote";
import type { Testimonial } from "@/components/ServicesPageClient";
import { EVENT_PILLARS } from "@/lib/event-pillars";
import { EventPosterCard } from "@/components/EventPosterCard";
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

// ── Color maps ────────────────────────────────────────────────────────────────
const winCardBg: Record<string, string> = {
  sand: "bg-[#F0EBD8] text-[#111111]",
  blue: "bg-[#0037D2] text-white",
  dark: "bg-[#111111] text-white",
};
const winAvatarBg: Record<string, string> = {
  blue: "bg-[#0037D2] text-white",
  lime: "bg-[#C1FF3B] text-[#111111]",
  primary: "bg-[#0037D2] text-white",
  accent: "bg-[#C1FF3B] text-[#111111]",
};
const postAvatarBg: Record<string, string> = {
  blue: "bg-[#0037D2] text-white",
  dark: "bg-[#111111] text-white",
};
const postTagBg: Record<string, string> = {
  lime:      "bg-[#C1FF3B] text-[#111111]",
  dark:      "bg-[#111111] text-white",
  lightBlue: "bg-[#D4F0FF] text-[#0a4a7a]",
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

const membershipTiers = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    desc: "Everything you need to join the community and start showing up.",
    features: [
      "Access to 8,000+ member network",
      "Citywise WhatsApp groups",
      "Weekly community digest & newsletter",
      "Free events & open meetups",
      "Community feed & announcements",
    ],
    cta: "Join Free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹5,000",
    period: "/ year",
    desc: "For members ready to plug into mentorship, content and priority access.",
    features: [
      "Everything in Free",
      "Priority seats at every event",
      "Mentor Match programme access",
      "Discounted content studio sessions",
      "Learning Hub premium resources",
    ],
    cta: "Become a Growth Member",
    highlight: true,
  },
  {
    name: "Founder",
    price: "₹25,000",
    period: "/ year",
    desc: "Our top tier — deep access, real relationships, and hands-on support.",
    features: [
      "Everything in Growth",
      "Invites to Retreats (fun, learning, wellness)",
      "1:1 concierge intros to experts & VCs",
      "Free content studio production day",
      "Direct line to the Successbrew team",
    ],
    cta: "Apply for Founder Tier",
    highlight: false,
  },
];

const resources = [
  { type: "Blogs",     count: "120+", desc: "Tactical articles on growth, fundraising and product-market fit.",    icon: "📝", bg: "bg-[#0037D2] text-white",    countColor: "text-[#C1FF3B]" },
  { type: "Playbooks", count: "35+",  desc: "Step-by-step frameworks for go-to-market, hiring and content.",       icon: "📖", bg: "bg-[#F0EBD8] text-[#111111]", countColor: "text-[#0037D2]" },
  { type: "Templates", count: "80+",  desc: "Investor decks, SOPs, content calendars — grab and go.",              icon: "📄", bg: "bg-[#F0EBD8] text-[#111111]", countColor: "text-[#0037D2]" },
  { type: "Ebooks",    count: "18+",  desc: "Deep dives from founders who did it and documented it.",               icon: "📘", bg: "bg-[#C1FF3B] text-[#111111]", countColor: "text-[#0037D2]" },
  { type: "Webinars",  count: "60+",  desc: "Recorded sessions with operators, VCs and brand builders.",           icon: "🎥", bg: "bg-[#111111] text-white",      countColor: "text-[#C1FF3B]" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function CommunityPageClient({ events, episodes, communityTestimonials, posts, communityPartners, communityMembers, siteSettings }: CommunityPageProps) {
  const [activeResource, setActiveResource] = useState("Blogs");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) =>
    setLikedPosts(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const eventPillars = EVENT_PILLARS.map((p) => ({
    ...p,
    count: events.filter((e) => e.category === p.category).length,
  }));
  const featuredEpisode = episodes.find((e) => e.isFeatured) ?? episodes[0];
  const listEpisodes    = episodes.filter((e) => !e.isFeatured).slice(0, 3);
  const previewEpisodes = (featuredEpisode ? [featuredEpisode, ...listEpisodes] : listEpisodes).slice(0, 3);

  return (
    <>
      <NavBar activePage="Community" ctaText="Join Community" ctaHref="/apply" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#F2ECDD] pt-32 pb-16 lg:pt-40 lg:pb-20">
          <CommunityMapBackground />
          <AmbientBackground tone="light" noise={false} />

          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.12)}>
              <motion.div variants={fadeUp}
                className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0037D2]" />
                Successbrew · India's Most Loved Startup Ecosystem
              </motion.div>

              <motion.h1
                initial="hidden" animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                className="whitespace-nowrap text-[clamp(1.6rem,5.6vw,6.5rem)] font-black leading-[0.95] tracking-tight text-[#111111]">
                {["Brew", "Your"].map((word, i) => (
                  <span key={i}>
                    <span className="inline-block overflow-hidden leading-[1.2]">
                      <motion.span className="inline-block" variants={{ hidden: { y: "110%", opacity: 0 }, visible: { y: "0%", opacity: 1, transition: { duration: 0.65, ease: E } } }}>{word}</motion.span>
                    </span>
                    {i === 0 ? " " : ""}
                  </span>
                ))}
                {" "}<span className="relative inline-block">
                  <span className="relative z-10 text-[#0037D2]">
                    {["Own", "Success."].map((word, i) => (
                      <span key={i}>
                        <span className="inline-block overflow-hidden leading-[1.2]">
                          <motion.span className="inline-block" variants={{ hidden: { y: "110%", opacity: 0 }, visible: { y: "0%", opacity: 1, transition: { duration: 0.65, ease: E } } }}>{word}</motion.span>
                        </span>
                        {i === 0 ? " " : ""}
                      </span>
                    ))}
                  </span>
                  <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-[#C1FF3B] md:h-6" />
                </span>
              </motion.h1>

              <motion.div variants={fadeUp} className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
                <p className="max-w-xl text-balance text-lg text-[#111111]/70 md:text-xl">
                  8000+ Founders, Freelancers, Agencies, Angels, Creators, and VCs — growing through shared opportunities, real visibility, and meaningful connections across India.
                </p>
                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <a href="/apply" className="inline-flex items-center gap-2 rounded-full bg-[#0037D2] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_40px_-10px_rgba(0,55,210,0.5)] transition hover:translate-y-[-2px]">Join Community</a>
                  <a href="#ecosystem" className="inline-flex items-center gap-2 rounded-full border border-[#111111]/15 bg-white px-7 py-4 text-base font-semibold text-[#111111] transition hover:bg-[#F0EBD8]">Explore Ecosystem</a>
                </div>
              </motion.div>
            </motion.div>

            {/* Community video */}
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.85, ease: E }}
              className="group relative mt-16 aspect-video w-full overflow-hidden rounded-[1.75rem] border border-[#111111]/5 bg-[#111111] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
              {/* TODO: swap for the real community video — set `src` on the <video> tag below */}
              <video className="h-full w-full object-cover" poster="/grid-images/IMG_9736.JPG" muted loop playsInline controls>
                Your browser does not support embedded video.
              </video>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-[#C1FF3B] text-[#111111] shadow-[0_10px_30px_rgba(193,255,59,0.4)] transition-transform group-hover:scale-110">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </span>
              </div>
              <span className="absolute left-5 top-5 rounded-full bg-[#C1FF3B] px-3 py-1 text-[11px] font-black text-[#111111]">Live Community</span>
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">8,000+ Members</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">See the Successbrew community in action</p>
                </div>
              </div>
            </motion.div>

            {/* Stat boxes */}
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}
              className="mt-8 flex flex-wrap justify-center gap-4">
              {([
                { num: "8000+",  label: "Members",         sub: "Founders · Creators · Investors", bg: "bg-[#0037D2] text-white",     subColor: "text-white/70",     floatDelay: 0   },
                { num: "200K+",  label: "Followers",       sub: "Across social platforms",          bg: "bg-[#F0EBD8] text-[#111111]", subColor: "text-[#111111]/55", floatDelay: 0.6 },
                { num: "200+",   label: "Events Hosted",   sub: "Summits, meetups & workshops",     bg: "bg-[#C1FF3B] text-[#111111]", subColor: "text-[#111111]/55", floatDelay: 1.2 },
                { num: "50+",    label: "Brand Partners",  sub: "Collaborations & partnerships",   bg: "bg-[#F0EBD8] text-[#111111]", subColor: "text-[#111111]/55", floatDelay: 1.8 },
                { num: "$8M+",   label: "Impact Created",  sub: "Value unlocked for our community", bg: "bg-[#0037D2] text-white",     subColor: "text-white/70",     floatDelay: 2.4 },
              ] as const).map(({ num, label, sub, bg, subColor, floatDelay }) => (
                <motion.div key={label}
                  variants={{ hidden: { opacity: 0, y: 18, scale: 0.94 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: E } } }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ y: { delay: 1.4 + floatDelay, duration: 3.2, repeat: Infinity, ease: "easeInOut" } }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.25, ease: E } }}
                  className={`relative w-[calc(50%-8px)] cursor-default overflow-hidden rounded-3xl border border-[#111111]/5 p-6 text-center shadow-[0_8px_32px_-8px_rgba(0,0,0,0.14)] sm:w-44 md:w-48 ${bg}`}>
                  <div className="text-3xl font-black tracking-tight sm:text-4xl">{num}</div>
                  <div className="mt-2 text-sm font-bold">{label}</div>
                  <div className={`mt-1 text-[11px] font-medium ${subColor}`}>{sub}</div>
                  <div aria-hidden className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ TICKER ════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="overflow-hidden bg-[#0037D2] py-3.5 text-white">
          <div className="flex w-max whitespace-nowrap animate-marquee">
            {Array.from({ length: 2 }).map((_, g) => (
              <div key={g} className="flex">
                {["Community", "Content Studio", "Podcast", "Events", "Learning Hub", "Mentor Network", "Visibility", "Momentum", "Belonging", "1L by 2030"].map(item => (
                  <span key={item} className="inline-flex items-center gap-8 px-6 text-[12px] font-bold uppercase tracking-[0.12em]">
                    {item}<span className="opacity-40">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══ ECOSYSTEM ═════════════════════════════════════════════════ */}
        <section id="ecosystem" className="bg-[#F0EBD8] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">The Ecosystem</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="6 Pillars of Successbrew Ecosystem" /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="#cta" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#111111] underline-offset-4 hover:underline">
                Join the ecosystem
              </motion.a>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {pillars.map((p) => (
                <motion.article key={p.num} variants={cardUp} whileHover={{ y: -6, transition: { duration: 0.3, ease: E } }}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#111111]/5 bg-white p-8 hover:border-[#0037D2]/30 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.2)] md:p-10">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.22em] text-[#111111]/40">
                      <span>{p.num}</span>
                      <span aria-hidden className="h-2 w-2 rounded-full bg-[#C1FF3B] transition group-hover:bg-[#0037D2]" />
                    </div>
                    <div className="mt-6 text-3xl">{p.icon}</div>
                    <h3 className="mt-4 text-2xl font-extrabold tracking-tight md:text-3xl">{p.title}</h3>
                    <p className="mt-4 text-[#111111]/60">{p.desc}</p>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {p.tags.map(t => <span key={t} className="rounded-full bg-[#F0EBD8] px-3 py-1 text-xs font-semibold text-[#111111]/70">{t}</span>)}
                    </div>
                    <span className="rounded-full bg-[#0037D2]/8 px-3 py-1 text-[11px] font-bold text-[#0037D2]">{p.badge}</span>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
        <SectionWave from="#F0EBD8" to="#F2ECDD" />

        <CommunityPartnerGrid partners={communityPartners} />
        <SectionWave from="#F2ECDD" to="#F0EBD8" />
        <LogoShowcase
          brandPartners={communityMembers}
          eyebrow="Who's Inside"
          heading="Community Members From"
          alwaysColor
          sectionBg="bg-[#F0EBD8]"
        />
        <SectionWave from="#F0EBD8" to="#F2ECDD" />

        {/* ══ COMMUNITY OFFERS (Membership Tiers) ══════════════════════════ */}
        <section id="offers" className="bg-[#F2ECDD] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Community Offers</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Pick your level of access." /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="#cta" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#111111] underline-offset-4 hover:underline">
                Join to unlock all offers
              </motion.a>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, ease: E }}
              className="mb-5 overflow-hidden rounded-[2rem] border border-[#111111]/5 bg-[#0037D2] text-white">
              <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
                <div className="p-10 lg:p-14">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C1FF3B]" /> Free · Always
                  </span>
                  <h3 className="mt-6 text-3xl font-black tracking-tight md:text-5xl">Free Community<br />Membership</h3>
                  <p className="mt-4 max-w-md text-base text-white/70">No cost to join. Get immediate access to India's largest startup and creator community — network, learn, and grow from day one.</p>
                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {["Access to 8,000+ member network", "Weekly community digest & newsletter", "Free events & open meetups", "Select learning resources", "Community feed & announcements", "Peer accountability groups"].map(item => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C1FF3B] text-[10px] font-black text-[#111111]">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a href="#cta" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-7 py-3.5 text-sm font-bold text-[#111111] transition hover:bg-white">Join Free</a>
                </div>
                <div className="relative hidden overflow-hidden lg:block">
                  <img src="/grid-images/IMG_9736.JPG" alt="Community members" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0037D2]/80 via-[#0037D2]/20 to-transparent" />
                  <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}
                    className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="text-2xl font-black text-white">8,000+</p>
                    <p className="mt-1 text-sm text-white/65">Members already inside</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="grid gap-6 lg:grid-cols-3">
              {membershipTiers.map((tier) => (
                <motion.div key={tier.name} variants={cardUp} whileHover={{ y: -6, transition: { duration: 0.3, ease: E } }}
                  className={`relative flex flex-col rounded-3xl border p-8 md:p-10 ${tier.highlight ? "border-[#0037D2] bg-[#0037D2] text-white shadow-[0_30px_60px_-30px_rgba(0,55,210,0.4)]" : "border-[#111111]/5 bg-[#F0EBD8]"}`}>
                  {tier.highlight && (
                    <span className="absolute -top-3 left-8 rounded-full bg-[#C1FF3B] px-3 py-1 text-[11px] font-black text-[#111111]">Most Popular</span>
                  )}
                  <p className={`text-xs font-bold uppercase tracking-[0.22em] ${tier.highlight ? "text-white/60" : "text-[#0037D2]"}`}>{tier.name}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tight md:text-5xl">{tier.price}</span>
                    {tier.period && <span className={tier.highlight ? "text-white/60" : "text-[#111111]/50"}>{tier.period}</span>}
                  </div>
                  <p className={`mt-4 text-sm ${tier.highlight ? "text-white/70" : "text-[#111111]/60"}`}>{tier.desc}</p>
                  <ul className="mt-8 flex-1 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className={`flex items-center gap-2.5 text-sm ${tier.highlight ? "text-white/80" : "text-[#111111]/75"}`}>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${tier.highlight ? "bg-[#C1FF3B] text-[#111111]" : "bg-[#0037D2] text-white"}`}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#cta" className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition ${tier.highlight ? "bg-[#C1FF3B] text-[#111111] hover:bg-white" : "bg-[#111111] text-white hover:bg-[#0037D2]"}`}>{tier.cta}</a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <SectionWave from="#F2ECDD" to="#0037D2" />

        {/* ══ OUR WHY ═══════════════════════════════════════════════════ */}
        <section className="bg-[#0037D2] py-16 text-white lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}>
                <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">Our Why</motion.p>
                <h2 className="mt-3 text-balance text-[clamp(2.6rem,5vw,5rem)] font-black leading-[0.95] tracking-tight">
                  <WordReveal text="Talent is everywhere." />{" "}<br />
                  <span className="text-[#C1FF3B]"><WordReveal text="Opportunity is not." /></span>
                </h2>
                <motion.p variants={fadeUp} className="mt-6 max-w-xl text-balance text-lg text-white/75">
                  Most ambitious Indians never get the room, the mentor, or the mic. Successbrew exists to close that gap — not by replacing hard work, but by amplifying it with access, visibility and a community that actually shows up.
                </motion.p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease: E }} className="relative">
                <div className="aspect-[3/4] overflow-hidden rounded-[2rem] border border-white/10">
                  <img src="/grid-images/edits-55.jpg" alt="Successbrew founder" className="h-full w-full object-cover object-top" />
                </div>
                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6, ease: E }}
                  className="absolute -bottom-5 left-6 rounded-2xl bg-[#C1FF3B] px-6 py-4 text-[#111111] shadow-lg">
                  <div className="text-2xl font-black">1 Lakh</div>
                  <div className="text-xs font-medium text-black/60">Entrepreneurs · Vision 2030</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Timeline — full section width, below the text/picture row */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mt-20">
              <ol className="relative grid grid-cols-5 gap-0">
                <div aria-hidden className="absolute left-0 right-0 top-6 h-px bg-white/20" />
                {[["2018", "Founded"], ["2023", "8K+"], ["2024", "54 Events"], ["2025", "150K"], ["2030", "1L 🎯"]].map(([yr, lbl], i) => (
                  <li key={yr} className="relative text-center">
                    <div className={`relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full border text-sm font-bold ${i === 4 ? "border-[#C1FF3B] bg-[#C1FF3B] text-[#111111]" : "border-white/30 bg-[#0037D2] text-white"}`}>{yr}</div>
                    <div className={`mt-3 text-xs font-bold ${i === 4 ? "text-[#C1FF3B]" : "text-white/60"}`}>{lbl}</div>
                  </li>
                ))}
              </ol>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.12)}
              className="mt-20 grid gap-6 md:grid-cols-3">
              {[
                { label: "Access",     value: "The room. The mentor. The mic.", desc: "Members get intros, speaking slots and investment conversations they couldn't manufacture alone." },
                { label: "Visibility", value: "150K eyes. Every month.",        desc: "Studio, podcast and community put your story in front of the right people at the right moment." },
                { label: "Momentum",   value: "From idea to traction.",         desc: "Playbooks, cohorts and accountability structures that compress years of learning into months." },
              ].map(({ label, value, desc }) => (
                <motion.div key={label} variants={cardUp} className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">{label}</p>
                  <p className="mt-2 text-lg font-black text-white">{value}</p>
                  <p className="mt-3 text-sm leading-7 text-white/60">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <SectionWave from="#0037D2" to="#F2ECDD" />

        {/* ══ WINS (CMS) ════════════════════════════════════════════════ */}
        <section id="wins" className="bg-[#F2ECDD] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Community Wins</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Success stories brewed here." /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="/community/testimonials" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#111111] underline-offset-4 hover:underline">
                Read all community stories
              </motion.a>
            </motion.div>
            {communityTestimonials.length > 0 ? (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.09)}
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {communityTestimonials.slice(0, 6).map((t) => (
                  <motion.figure key={t._id} variants={cardUp} whileHover={{ y: -5, transition: { duration: 0.3, ease: E } }}
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
        <SectionWave from="#F2ECDD" to="#F0EBD8" />

        {/* ══ EVENTS (CMS) ══════════════════════════════════════════════ */}
        <section id="events" className="bg-[#F0EBD8] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Four Rooms, One Ecosystem</p>
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
              className="mt-6 rounded-2xl border border-dashed border-[#0037D2]/30 bg-[#0037D2]/5 p-6 text-center">
              <p className="text-sm font-bold text-[#0037D2]">54+ events hosted across India</p>
              <p className="mt-1 text-xs text-[#111111]/50">Mumbai · Delhi · Bengaluru · Hyderabad · Pune</p>
            </motion.div>
          </div>
        </section>
        <SectionWave from="#F0EBD8" to="#F2ECDD" />

        {/* ══ PODCAST (CMS) ═════════════════════════════════════════════ */}
        <section id="podcast" className="bg-[#F2ECDD] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Successbrew Podcast</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="Real talk. Real founders." /></h2>
              </motion.div>
              <motion.a variants={fadeUp} href="/community/podcast" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#111111] underline-offset-4 hover:underline">
                All Episodes
              </motion.a>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {previewEpisodes.map((ep) => (
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
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 rounded-2xl border border-[#111111]/5 bg-white p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#111111]/45">100+ Episodes · 60+ Guests</p>
              <a href="/community/podcast" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0037D2] hover:underline">All Episodes →</a>
            </motion.div>
          </div>
        </section>
        <SectionWave from="#F2ECDD" to="#F0EBD8" />

        {/* ══ LEARNING HUB ══════════════════════════════════════════════ */}
        <section id="learning-hub" className="bg-[#F2ECDD] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.1)}
              className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Learning Hub</p>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl"><WordReveal text="200+ resources built for builders." /></h2>
              </motion.div>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
                {resources.map(r => (
                  <button key={r.type} onClick={() => setActiveResource(r.type)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activeResource === r.type ? "border-[#0037D2] bg-[#0037D2] text-white" : "border-[#111111]/15 bg-white text-[#111111]/70 hover:border-[#111111]/30 hover:text-[#111111]"}`}>
                    {r.type}
                  </button>
                ))}
              </motion.div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.09)}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {resources.map((r) => (
                <motion.div key={r.type} variants={cardUp} whileHover={{ y: -5, transition: { duration: 0.25, ease: E } }} onClick={() => setActiveResource(r.type)}
                  className={`flex cursor-pointer flex-col justify-between rounded-3xl p-7 transition-shadow hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.14)] ${r.bg} ${activeResource === r.type ? "ring-2 ring-offset-2 ring-[#0037D2]" : ""}`}>
                  <div>
                    <div className="text-3xl">{r.icon}</div>
                    <h3 className="mt-4 text-lg font-black">{r.type}</h3>
                    <p className={`mt-0.5 text-2xl font-black ${r.countColor}`}>{r.count}</p>
                    <p className="mt-3 text-sm leading-7 opacity-70">{r.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveResource(r.type); }}
                    className={`mt-6 inline-flex items-center gap-2 text-sm font-bold ${r.countColor} hover:underline`}
                  >
                    Coming Soon...
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <SectionWave from="#F2ECDD" to="#111111" />

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section id="cta" className="relative overflow-hidden bg-[#111111] text-white">
          <AmbientBackground tone="dark" />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.14)}
            className="relative mx-auto max-w-7xl px-6 py-28 text-center lg:px-10 lg:py-40">
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">8,000+ already inside</motion.p>
            <motion.h2 variants={fadeUp} className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">
              Ready to <span className="text-[#C1FF3B]">Brew Yours?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-xl text-lg text-white/60">
              Join a community of founders, creators and students building India's next decade — together.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <a href="/apply" className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px] hover:bg-[#b6eb32]">Join Community</a>
              <a href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">Our Story</a>
            </motion.div>
          </motion.div>
        </section>

        <Footer siteSettings={siteSettings} />

      </main>
    </>
  );
}
