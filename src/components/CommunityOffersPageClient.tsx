/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { WordReveal } from "@/components/WordReveal";
import { Toaster } from "@/components/ui/sonner";
import type { SiteSettings } from "@/components/SocialLinks";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: E } } };
const cardUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

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
    href: "/apply?source=community",
    comingSoon: false,
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
    href: "/community/join/growth",
    // Real checkout link is live — it's what the "you're approved" email
    // sends approved applicants to. The public card itself stays gated:
    // a visitor clicking it here (not from that email) sees "Coming soon".
    comingSoon: true,
    highlight: true,
  },
  {
    name: "Founder",
    price: "₹100,000",
    period: "/ year",
    desc: "Our top tier — deep access, real relationships, and hands-on support.",
    features: [
      "Everything in Growth",
      "Invites to Retreats (fun, learning, wellness)",
      "1:1 concierge intros to experts & VCs",
      "Free content studio production day",
      "Direct line to the Successbrew team",
    ],
    cta: "Become a Founder Member",
    href: "/community/join/founder",
    comingSoon: true,
    highlight: false,
  },
];

export function CommunityOffersPageClient({ siteSettings }: { siteSettings: SiteSettings }) {
  return (
    <>
      <NavBar activePage="Community" ctaText="Join Community" ctaHref="/apply?source=community" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#F2ECDD] pt-32 pb-20 lg:pt-44 lg:pb-28">
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
                Community Offers
              </motion.div>

              <h1 className="text-balance text-[clamp(2.75rem,7vw,6rem)] font-black leading-[0.95] tracking-tight text-[#111111]">
                <WordReveal text="Pick your level of" mode="nested" staggerDelay={0.06} />
                {" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#0037D2]"><WordReveal text="access." mode="nested" staggerDelay={0.06} /></span>
                  <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-[#C1FF3B] md:h-6" />
                </span>
              </h1>

              <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg text-[#111111]/60 md:text-xl">
                Free to join, always. Growth and Founder tiers unlock deeper access, mentorship and hands-on support as you scale.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ══ OFFERS ════════════════════════════════════════════════════ */}
        <section className="bg-[#F2ECDD] pb-16 lg:pb-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
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
                  <a href="/apply?source=community" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-7 py-3.5 text-sm font-bold text-[#111111] transition hover:bg-white">Join Free</a>
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
                  {tier.comingSoon ? (
                    <button type="button"
                      onClick={() => toast("Coming soon — we'll email approved community members as soon as it's open.")}
                      className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition ${tier.highlight ? "bg-[#C1FF3B] text-[#111111] hover:bg-white" : "bg-[#111111] text-white hover:bg-[#0037D2]"}`}>
                      {tier.cta}
                    </button>
                  ) : (
                    <a href={tier.href} className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition ${tier.highlight ? "bg-[#C1FF3B] text-[#111111] hover:bg-white" : "bg-[#111111] text-white hover:bg-[#0037D2]"}`}>{tier.cta}</a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <Footer siteSettings={siteSettings} />
        <Toaster position="top-center" />
      </main>
    </>
  );
}
