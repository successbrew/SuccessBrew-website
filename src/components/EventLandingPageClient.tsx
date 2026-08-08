/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SectionWave } from "@/components/SectionWave";
import { WordReveal } from "@/components/WordReveal";
import type { SiteSettings } from "@/components/SocialLinks";
import type { EventPillar } from "@/lib/event-pillars";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

export interface EventLandingData {
  id: string;
  title: string;
  tag: string;
  date: string;
  eventDate: string;
  location: string;
  imageUrl: string | null;
  subtitle: string | null;
  timeRange: string | null;
  priceNote: string | null;
  audienceNote: string | null;
  highlightStatValue: string | null;
  highlightStatLabel: string | null;
  totalSeats: number | null;
  remainingSeats: number | null;
  showRemainingSeats: boolean;
  venueAddress: string | null;
  venuePhotoUrl: string | null;
  agenda: string | null;
  hostName: string | null;
  hostRole: string | null;
  hostBio: string | null;
  hostPhotoUrl: string | null;
  registerUrl: string | null;
  seatsNote: string | null;
  benefits: string[];
  becomePartnerUrl: string | null;
  speakers: { id: string; name: string; role: string | null; bio: string | null; photoUrl: string | null }[];
  partners: { id: string; name: string; logoUrl: string; websiteUrl: string | null }[];
}

export interface RelatedEvent {
  id: string;
  title: string;
  tag: string;
  date: string;
  eventDate: string;
  location: string;
}

function firstToken(s: string) {
  return s.split(/[·,]/)[0]?.trim() ?? s;
}

interface AgendaItem { time?: string; title: string; description?: string }

function parseAgenda(raw: string | null): AgendaItem[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 3) return { time: parts[0], title: parts[1], description: parts.slice(2).join(" | ") };
      if (parts.length === 2) return { time: parts[0], title: parts[1] };
      return { title: parts[0] ?? line };
    });
}

interface BenefitItem { title: string; description?: string }

function parseBenefits(list: string[]): BenefitItem[] {
  return list.map((line) => {
    const idx = line.indexOf("|");
    if (idx === -1) return { title: line };
    return { title: line.slice(0, idx).trim(), description: line.slice(idx + 1).trim() };
  });
}

/** Computed "N of Total seats left" line, falling back to the admin's free-text
 * seatsNote override when set, and to a total-only/open-seating line otherwise.
 * Remaining-seat count is only surfaced when the admin has toggled it on. */
function seatsSummary(event: EventLandingData, { totalSuffix, fallback }: { totalSuffix: string; fallback: string }) {
  if (event.seatsNote) return event.seatsNote;
  if (event.totalSeats != null) {
    if (event.showRemainingSeats && event.remainingSeats != null) {
      return `${event.remainingSeats} of ${event.totalSeats} seats left`;
    }
    return `${event.totalSeats} ${totalSuffix}`;
  }
  return fallback;
}

function googleCalendarUrl(event: EventLandingData) {
  const d = new Date(event.eventDate);
  const fmt = (dt: Date) => dt.toISOString().slice(0, 10).replace(/-/g, "");
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${fmt(d)}/${fmt(next)}`,
    location: event.venueAddress || event.location,
    details: event.subtitle || event.tag,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex-1 rounded-full border border-[#111111]/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[#111111]/70 transition hover:border-[#111111]/30"
    >
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

export function EventLandingPageClient({
  pillar,
  event,
  relatedEvents,
  siteSettings,
}: {
  pillar: EventPillar;
  event: EventLandingData;
  relatedEvents: RelatedEvent[];
  siteSettings: SiteSettings;
}) {
  const agendaItems = parseAgenda(event.agenda);
  const benefitItems = parseBenefits(event.benefits);
  const venue = event.venueAddress || event.location;
  const registerHref = event.registerUrl ?? "#registration";
  const hasTimedAgenda = agendaItems.some((a) => a.time);
  const heroDate = new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();

  return (
    <>
      <NavBar activePage="Community" ctaText="Join Community" ctaHref="/apply" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#0037D2] pt-32 pb-20 text-white lg:pt-44 lg:pb-28">
          {event.imageUrl ? (
            <>
              {/* Cover images here are typically pre-designed banners with their own
                  title/date text baked in, not plain photography — heavy blur turns
                  them into a color/mood wash so they never compete with the real,
                  crisp title rendered on top. */}
              <div
                aria-hidden
                className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
                style={{ backgroundImage: `url(${event.imageUrl})` }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0037D2]/78 via-[#0037D2]/42 to-[#0037D2]/88"
              />
            </>
          ) : (
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/10" />
              <div className="absolute left-[-100px] bottom-[-120px] h-[300px] w-[300px] rounded-full bg-[#C1FF3B]/10 blur-3xl" />
            </div>
          )}
          <div className="relative mx-auto max-w-5xl px-6 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.11)}>
              <motion.a variants={fadeUp} href={`/community/events/${pillar.slug}`}
                className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 hover:text-white">
                ← Back to {pillar.title}
              </motion.a>

              <motion.div variants={fadeUp} className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#C1FF3B] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#111111]">
                  {event.tag}
                </span>
                <span className="rounded-full border border-white/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
                  {firstToken(event.location)}
                </span>
                {event.priceNote && (
                  <span className="rounded-full border border-white/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
                    {event.priceNote}
                  </span>
                )}
              </motion.div>

              <motion.p variants={fadeUp} className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">
                Successbrew Events · {heroDate}
              </motion.p>

              <h1 className="text-balance text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.95] tracking-tight text-white">
                <WordReveal text={event.title} mode="nested" staggerDelay={0.06} />
              </h1>

              {event.subtitle && (
                <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-white/70">
                  {event.subtitle}
                </motion.p>
              )}
            </motion.div>
          </div>
        </section>

        {/* ══ INFO BAR ══════════════════════════════════════════════════ */}
        <div className="relative z-10 mx-auto -mt-10 max-w-5xl px-6 lg:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp}
            className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-white p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.35)] lg:p-8">
            <div className="grid grow grid-cols-2 gap-6 sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Date</p>
                <p className="mt-1 text-sm font-bold text-[#111111]">{event.date}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Time</p>
                <p className="mt-1 text-sm font-bold text-[#111111]">{event.timeRange ?? "TBA"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Where</p>
                <p className="mt-1 truncate text-sm font-bold text-[#111111]">{event.location}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]/40">Seats</p>
                <p className="mt-1 truncate text-sm font-bold text-[#0037D2]">
                  {seatsSummary(event, { totalSuffix: "seats", fallback: "Open seating" })}
                </p>
              </div>
            </div>
            <a href={registerHref} target={event.registerUrl ? "_blank" : undefined} rel="noreferrer noopener"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#C1FF3B] px-7 py-3.5 text-sm font-bold text-[#111111] transition hover:translate-y-[-2px]">
              Save my seat →
            </a>
          </motion.div>
        </div>

        {/* ══ MAIN CONTENT ══════════════════════════════════════════════ */}
        <section className="bg-[#F2ECDD] pb-16 pt-16 lg:pb-24 lg:pt-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-3 lg:px-10">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-16 lg:col-span-2">

              {benefitItems.length > 0 && (
                <div>
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">What You&rsquo;ll Leave With</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">What you walk away with.</h2>
                  </motion.div>
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
                    className="grid gap-5 sm:grid-cols-3">
                    {benefitItems.map((b, i) => (
                      <motion.div key={i} variants={fadeUp} className="rounded-2xl bg-white p-5">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0037D2] text-xs font-black text-white">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="mt-3 text-base font-black leading-snug text-[#111111]">{b.title}</h3>
                        {b.description && <p className="mt-1.5 text-sm text-[#111111]/60">{b.description}</p>}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {agendaItems.length > 0 && (
                <div>
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Run of Show</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">The agenda.</h2>
                  </motion.div>
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.06)}
                    className="divide-y divide-[#111111]/8 rounded-2xl bg-white">
                    {agendaItems.map((item, i) => (
                      <motion.div key={i} variants={fadeUp} className="flex gap-4 p-5 sm:gap-6 sm:p-6">
                        {hasTimedAgenda && (
                          <span className="w-20 shrink-0 text-sm font-bold text-[#0037D2] sm:w-24">{item.time}</span>
                        )}
                        <div>
                          <h3 className="text-base font-black text-[#111111]">{item.title}</h3>
                          {item.description && <p className="mt-1 text-sm text-[#111111]/60">{item.description}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {(event.speakers.length > 0 || event.hostName) && (
                <div>
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">On the Mic</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Who you&rsquo;ll hear from.</h2>
                  </motion.div>
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger(0.08)}
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {event.speakers.map((s) => (
                      <motion.div key={s.id} variants={fadeUp} className="overflow-hidden rounded-2xl bg-white">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0037D2]/10">
                          {s.photoUrl ? (
                            <img src={s.photoUrl} alt={s.name} className="h-full w-full object-cover object-top" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-2xl font-black text-[#0037D2]/25">
                              {s.name.charAt(0)}
                            </div>
                          )}
                          <span className="absolute left-3 top-3 rounded-full bg-[#C1FF3B] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#111111]">
                            Speaker
                          </span>
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-black text-[#111111]">{s.name}</p>
                          {s.role && <p className="mt-0.5 text-xs font-semibold text-[#0037D2]">{s.role}</p>}
                          {s.bio && <p className="mt-1.5 text-xs text-[#111111]/60">{s.bio}</p>}
                        </div>
                      </motion.div>
                    ))}
                    {event.hostName && (
                      <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0037D2]/10">
                          {event.hostPhotoUrl ? (
                            <img src={event.hostPhotoUrl} alt={event.hostName} className="h-full w-full object-cover object-top" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-2xl font-black text-[#0037D2]/25">
                              {event.hostName.charAt(0)}
                            </div>
                          )}
                          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#0037D2]">
                            Host
                          </span>
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-black text-[#111111]">{event.hostName}</p>
                          {event.hostRole && <p className="mt-0.5 text-xs font-semibold text-[#0037D2]">{event.hostRole}</p>}
                          {event.hostBio && <p className="mt-1.5 text-xs text-[#111111]/60">{event.hostBio}</p>}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              )}

              {event.audienceNote && (
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                  className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-[#F0EBD8] p-8">
                  <div className="max-w-md">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#111111]/50">Who&rsquo;s in the Room</p>
                    <p className="mt-3 text-base leading-relaxed text-[#111111]/75">{event.audienceNote}</p>
                  </div>
                  <div className="flex gap-8">
                    {event.totalSeats && (
                      <div>
                        <p className="text-3xl font-black text-[#0037D2]">{event.totalSeats}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#111111]/50">Seats</p>
                        {event.showRemainingSeats && event.remainingSeats != null && (
                          <p className="mt-1 text-[10px] font-semibold text-[#111111]/40">{event.remainingSeats} left</p>
                        )}
                      </div>
                    )}
                    {event.highlightStatValue && (
                      <div>
                        <p className="text-3xl font-black text-[#0037D2]">{event.highlightStatValue}</p>
                        <p className="mt-1 max-w-[8rem] text-[10px] font-bold uppercase tracking-[0.12em] text-[#111111]/50">{event.highlightStatLabel}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div id="registration" className="scroll-mt-28 rounded-2xl bg-[#0037D2] p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">Registration</p>
                <h3 className="mt-2 text-xl font-black leading-tight">{event.priceNote ?? "Reserve your seat"}</h3>
                <p className="mt-2 text-sm text-white/70">
                  {seatsSummary(event, { totalSuffix: "seats total", fallback: "Limited seating" })}
                </p>
                <a href={registerHref} target={event.registerUrl ? "_blank" : undefined} rel="noreferrer noopener"
                  className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#C1FF3B] px-6 py-3.5 text-sm font-bold text-[#111111] transition hover:translate-y-[-2px]">
                  Save my seat →
                </a>
                {!event.registerUrl && (
                  <p className="mt-3 text-xs text-white/50">Registration link coming soon — check back shortly.</p>
                )}
              </div>

              {venue && (
                <div className="rounded-2xl border border-[#111111]/8 bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#111111]/40">Getting There</p>
                  <p className="mt-3 text-sm font-black text-[#111111]">{event.location}</p>
                  {event.venueAddress && <p className="mt-1 text-sm text-[#111111]/60">{event.venueAddress}</p>}
                  <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F0EBD8]">
                    <iframe
                      title={`Map to ${event.location}`}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(venue)}&output=embed`}
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer noopener"
                      className="flex-1 rounded-full bg-[#111111] px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#0037D2]">
                      Add to calendar
                    </a>
                    <ShareButton title={event.title} />
                  </div>
                </div>
              )}

              {relatedEvents.length > 0 && (
                <div className="rounded-2xl border border-[#111111]/8 bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-black text-[#111111]">Can&rsquo;t make this one?</h3>
                    <a href={`/community/events/${pillar.slug}`} className="text-xs font-bold uppercase tracking-wide text-[#0037D2] hover:underline">
                      All events →
                    </a>
                  </div>
                  <div className="divide-y divide-[#111111]/8">
                    {relatedEvents.map((r) => (
                      <a key={r.id} href={`/community/events/${pillar.slug}/${r.id}`} className="group block py-3 first:pt-0 last:pb-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#0037D2]">{r.tag} · {r.date}</p>
                        <p className="mt-1 text-sm font-bold text-[#111111] group-hover:text-[#0037D2]">{r.title}</p>
                        <span className="mt-1 inline-block text-xs font-semibold text-[#111111]/40 group-hover:text-[#0037D2]">View event →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* ══ BECOME A PARTNER ═════════════════════════════════════════ */}
        {event.becomePartnerUrl && (
          <>
            <SectionWave from="#F2ECDD" to="#0037D2" />
            <section className="bg-[#0037D2] py-20 text-white lg:py-28">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.12)}
                className="mx-auto max-w-2xl px-6 text-center lg:px-10">
                <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.22em] text-[#C1FF3B]">Sponsor this room</motion.p>
                <motion.h2 variants={fadeUp} className="mt-4 text-balance text-4xl font-black tracking-tight md:text-5xl">Become a Partner.</motion.h2>
                <motion.div variants={fadeUp} className="mt-8">
                  <a href={event.becomePartnerUrl} target="_blank" rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full bg-[#C1FF3B] px-8 py-4 text-base font-bold text-[#111111] transition hover:translate-y-[-2px]">
                    Become a Partner
                  </a>
                </motion.div>
              </motion.div>
            </section>
            <SectionWave from="#0037D2" to="#F2ECDD" />
          </>
        )}

        {/* ══ PARTNERS ══════════════════════════════════════════════════ */}
        {event.partners.length > 0 && (
          <section className="bg-[#F2ECDD] py-16 lg:py-20">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#111111]/40">Partners</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                {event.partners.map((p) => {
                  const logo = (
                    <img
                      src={p.logoUrl}
                      alt={p.name}
                      className="h-9 w-auto object-contain grayscale transition hover:grayscale-0"
                    />
                  );
                  return p.websiteUrl ? (
                    <a key={p.id} href={p.websiteUrl} target="_blank" rel="noreferrer noopener" aria-label={p.name}>
                      {logo}
                    </a>
                  ) : (
                    <span key={p.id}>{logo}</span>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
