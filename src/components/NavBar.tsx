/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clapperboard, Settings, Sparkles, MessageCircle,
  Globe, Gift, Calendar, Mic, Trophy, BookOpen,
  FolderOpen, GraduationCap, Handshake, BookText, Star,
  User, Rocket, type LucideIcon,
} from "lucide-react";
import Link from "next/link";

// Hover button — scales up slightly so the cursor's position over it reads clearly, no cursor-chasing wobble
function MagneticLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return (
    <motion.a href={href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }} className={className}>
      {children}
    </motion.a>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface DropdownItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
}

interface Featured {
  bg: string;
  textColor: "white" | "dark";
  eyebrow: string;
  stat: string;
  statLabel: string;
  sub: string;
  ctaText: string;
  ctaHref: string;
}

interface NavEntry {
  label: string;
  href: string;
  dropdown?: {
    items: DropdownItem[];
    featured: Featured;
    footerLeft: string;
    footerLeftHref: string;
    footerRight: string;
    footerRightHref: string;
  };
}

// ── Nav data ──────────────────────────────────────────────────────────────────
const NAV: NavEntry[] = [
  {
    label: "Services",
    href: "/",
    dropdown: {
      items: [
        { icon: Clapperboard, title: "What We Do",    desc: "Full studio service offerings",       href: "/#services" },
        { icon: Settings,     title: "Our Process",   desc: "How we collaborate with you",         href: "/#process"  },
        { icon: Sparkles,     title: "Selected Work", desc: "Case studies & brand results",        href: "/#work"        },
        { icon: MessageCircle, title: "Client Voices", desc: "What our founders say",               href: "/#voices"   },
      ],
      featured: {
        bg: "bg-[#0037D2]",
        textColor: "white",
        eyebrow: "Studio · Podcast · Growth",
        stat: "50+",
        statLabel: "Brands Built",
        sub: "From zero to visibility",
        ctaText: "Free Consultation",
        ctaHref: "/#cta",
      },
      footerLeft: "All Services",         footerLeftHref: "/#services",
      footerRight: "Start a Project", footerRightHref: "/#cta",
    },
  },
  {
    label: "Community",
    href: "/community",
    dropdown: {
      items: [
        { icon: Globe,    title: "Ecosystem",      desc: "The 6 pillars of Successbrew",        href: "/community#ecosystem"    },
        { icon: Gift,     title: "Offers",         desc: "What every member unlocks",           href: "/community#offers"       },
        { icon: Calendar, title: "Events",         desc: "Meetups, summits & workshops",        href: "/community/events"       },
        { icon: Mic,      title: "Podcast",        desc: "100+ raw founder conversations",      href: "/community/podcast"      },
        { icon: Trophy,   title: "Community Wins", desc: "Stories from our members",            href: "/community#wins"         },
        { icon: BookOpen, title: "Learning Hub",   desc: "200+ playbooks, templates & ebooks", href: "/community#learning-hub" },
      ],
      featured: {
        bg: "bg-[#C1FF3B]",
        textColor: "dark",
        eyebrow: "India's Startup Community",
        stat: "8K+",
        statLabel: "Members",
        sub: "Free to join · Always",
        ctaText: "Join Free",
        ctaHref: "/community#cta",
      },
      footerLeft: "Browse Community",  footerLeftHref: "/community",
      footerRight: "Join Now",       footerRightHref: "/community#cta",
    },
  },
  {
    label: "Courses",
    href: "/courses",
    dropdown: {
      items: [
        { icon: FolderOpen,    title: "Course Categories",  desc: "Coming soon",  href: "/courses" },
        { icon: GraduationCap, title: "Featured Courses",   desc: "Coming soon",  href: "/courses" },
        { icon: Handshake,     title: "Mentor Network",     desc: "Coming soon",  href: "/courses" },
        { icon: BookText,      title: "Resource Library",   desc: "Coming soon",  href: "/courses" },
        { icon: Star,          title: "Success Stories",    desc: "Coming soon",  href: "/courses" },
      ],
      featured: {
        bg: "bg-[#111111]",
        textColor: "white",
        eyebrow: "Coming Soon",
        stat: "🚀",
        statLabel: "In the works",
        sub: "Courses, mentors & playbooks — launching soon.",
        ctaText: "Get Notified",
        ctaHref: "/courses",
      },
      footerLeft: "Learn more",         footerLeftHref: "/courses",
      footerRight: "Join Community",  footerRightHref: "/apply",
    },
  },
  {
    label: "About",
    href: "/about",
    dropdown: {
      items: [
        { icon: User,   title: "Our Story",         desc: "How Successbrew began in 2018",       href: "/about#story" },
        { icon: Rocket, title: "Join the Mission",  desc: "Be part of something bigger",         href: "/about#join"  },
      ],
      featured: {
        bg: "bg-[#0037D2]",
        textColor: "white",
        eyebrow: "The Successbrew Story",
        stat: "2018",
        statLabel: "Founded",
        sub: "Building India's startup future",
        ctaText: "Meet the Founder",
        ctaHref: "/about",
      },
      footerLeft: "Our Story",            footerLeftHref: "/about#story",
      footerRight: "Join the Mission",  footerRightHref: "/about#join",
    },
  },
];

// ── Animation ─────────────────────────────────────────────────────────────────
const E = [0.22, 1, 0.36, 1] as const;

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: E } },
  exit:    { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.16, ease: E } },
};

const itemVariants = {
  hidden:   { opacity: 0, x: -6 },
  visible:  { opacity: 1, x: 0  },
};

const staggerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
};

// ── Component ─────────────────────────────────────────────────────────────────
interface NavBarProps {
  /** "light" = cream bg, dark text. "dark" = transparent black on scroll. */
  variant?: "light" | "dark";
  ctaText?: string;
  ctaHref?: string;
  /** Highlight which nav label as "active" */
  activePage?: string;
}

export default function NavBar({
  variant = "light",
  ctaText = "Join Community",
  ctaHref = "/apply",
  activePage,
}: NavBarProps) {
  const [open, setOpen]               = useState<string | null>(null);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const openTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleEnter = (label: string) => {
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(label), 60);
  };

  const handleLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 200);
  };

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const isDark = variant === "dark";
  const headerBg =
    isDark
      ? scrolled ? "bg-[#111111]/95 backdrop-blur-xl border-white/8" : "bg-transparent border-transparent"
      : scrolled ? "bg-[#F2ECDD]/95 backdrop-blur-xl border-[#111111]/5" : "bg-[#F2ECDD]/65 backdrop-blur-md border-[#111111]/5";

  const logoFilter = isDark ? "brightness(0) invert(1)" : "contrast(1.5) brightness(1.1)";
  const logoBlend  = isDark ? undefined : ("multiply" as const);
  const navTextColor = isDark ? "text-white/65 hover:text-white" : "text-[#111111]/65 hover:text-[#111111]";
  const activeColor  = isDark ? "text-white"   : "text-[#111111]";
  const ctaBg        = isDark ? "bg-white text-[#111111] hover:bg-[#C1FF3B]" : "bg-[#111111] text-white hover:bg-[#0037D2]";
  const chevronColor = isDark ? "text-white/40" : "text-[#111111]/30";

  return (
    <>
      <header className={`fixed inset-x-3 top-3 z-50 mx-auto max-w-7xl rounded-full border shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] transition-all duration-300 sm:inset-x-6 sm:top-4 lg:inset-x-10 ${headerBg}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Logo */}
          <Link href="/" className="inline-flex shrink-0 items-center">
            <img
              src="/SB-logo.png"
              alt="Successbrew"
              style={{ height: 25, width: "auto", objectFit: "contain", mixBlendMode: logoBlend, filter: logoFilter }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" onMouseLeave={handleLeave}>
            {NAV.map((entry) => (
              <div key={entry.label} className="relative" onMouseEnter={() => handleEnter(entry.label)}>
                <Link
                  href={entry.href}
                  className={`relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors
                    ${activePage === entry.label ? activeColor : navTextColor}`}
                >
                  {/* Sliding active pill */}
                  {(activePage === entry.label || open === entry.label) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(17,17,17,0.06)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative z-10">{entry.label}</span>
                  {entry.dropdown && (
                    <motion.svg
                      animate={{ rotate: open === entry.label ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`relative z-10 h-3.5 w-3.5 ${chevronColor}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </motion.svg>
                  )}
                </Link>

                {/* Mega dropdown */}
                <AnimatePresence>
                  {open === entry.label && entry.dropdown && (
                    <motion.div
                      key={entry.label}
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      onMouseEnter={() => clearTimeout(closeTimer.current)}
                      onMouseLeave={handleLeave}
                      className="absolute left-1/2 top-full mt-3 w-[540px] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#111111]/8 bg-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.22)]"
                      style={{ transformOrigin: "top center" }}
                    >
                      {/* Gradient accent top bar */}
                      <div className="h-[2.5px] bg-gradient-to-r from-[#0037D2] via-[#0037D2] to-[#C1FF3B]" />

                      <div className="grid grid-cols-[1fr_164px]">
                        {/* Items */}
                        <div className="p-4">
                          <motion.ul
                            variants={staggerVariants}
                            initial="hidden"
                            animate="visible"
                            className={`grid gap-1 ${entry.dropdown.items.length > 4 ? "grid-cols-2" : "grid-cols-1"}`}
                          >
                            {entry.dropdown.items.map((item) => {
                              const hash = item.href.includes("#") ? item.href.split("#")[1] : null;
                              const isHere = hash !== null && hash === activeSection;
                              return (
                                <motion.li key={item.title} variants={itemVariants}>
                                  <Link
                                    href={item.href}
                                    onClick={() => setOpen(null)}
                                    className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#F5F5F3]"
                                  >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0037D2]/8">
                                      <item.icon className="h-[18px] w-[18px] text-[#0037D2]" strokeWidth={2} />
                                    </span>
                                    <div>
                                      <div className="text-[13px] font-semibold text-[#111111] group-hover:text-[#0037D2] transition-colors">{item.title}</div>
                                      {isHere ? (
                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0037D2]">
                                          <span className="h-1.5 w-1.5 rounded-full bg-[#0037D2]" />
                                          You&apos;re here
                                        </div>
                                      ) : (
                                        <div className="text-[11px] text-[#111111]/45 leading-tight">{item.desc}</div>
                                      )}
                                    </div>
                                  </Link>
                                </motion.li>
                              );
                            })}
                          </motion.ul>
                        </div>

                        {/* Featured panel */}
                        <div className={`flex flex-col justify-between p-5 ${entry.dropdown.featured.bg}`}>
                          <div>
                            <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${entry.dropdown.featured.textColor === "white" ? "text-white/50" : "text-[#111111]/50"}`}>
                              {entry.dropdown.featured.eyebrow}
                            </p>
                            <p className={`mt-3 text-3xl font-black leading-none ${entry.dropdown.featured.textColor === "white" ? "text-white" : "text-[#111111]"}`}>
                              {entry.dropdown.featured.stat}
                            </p>
                            <p className={`mt-0.5 text-xs font-bold ${entry.dropdown.featured.textColor === "white" ? "text-white" : "text-[#111111]"}`}>
                              {entry.dropdown.featured.statLabel}
                            </p>
                            <p className={`mt-2 text-[11px] leading-5 ${entry.dropdown.featured.textColor === "white" ? "text-white/60" : "text-[#111111]/55"}`}>
                              {entry.dropdown.featured.sub}
                            </p>
                          </div>
                          <Link
                            href={entry.dropdown.featured.ctaHref}
                            onClick={() => setOpen(null)}
                            className={`mt-4 inline-flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold transition
                              ${entry.dropdown.featured.textColor === "white"
                                ? "bg-white/15 text-white hover:bg-white/25"
                                : "bg-[#111111]/10 text-[#111111] hover:bg-[#111111]/18"}`}
                          >
                            {entry.dropdown.featured.ctaText}
                          </Link>
                        </div>
                      </div>

                      {/* Footer bar */}
                      <div className="flex items-center justify-between border-t border-[#111111]/5 bg-[#F9F9F8] px-5 py-3">
                        <Link href={entry.dropdown.footerLeftHref} onClick={() => setOpen(null)}
                          className="text-[12px] font-medium text-[#111111]/50 transition hover:text-[#111111]">
                          {entry.dropdown.footerLeft}
                        </Link>
                        <Link href={entry.dropdown.footerRightHref} onClick={() => setOpen(null)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#0037D2] px-3.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#0028a8]">
                          {entry.dropdown.footerRight}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2">
            <MagneticLink href={ctaHref}
              className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:inline-flex sm:px-5 sm:py-2.5 sm:text-sm ${ctaBg}`}>
              {ctaText}
            </MagneticLink>
            <button
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition md:hidden
                ${isDark ? "text-white/70 hover:bg-white/8 hover:text-white" : "text-[#111111]/60 hover:bg-[#111111]/5 hover:text-[#111111]"}`}
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              }
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: E }}
              className="fixed inset-x-3 top-20 z-50 overflow-y-auto rounded-3xl border border-[#111111]/10 bg-white shadow-2xl md:hidden"
              style={{ maxHeight: "calc(100dvh - 96px)" }}
            >
              <nav className="px-5 py-3">
                {NAV.map((entry) => (
                  <div key={entry.label} className="border-b border-[#111111]/5 last:border-0">
                    <Link href={entry.href}
                      className="flex items-center justify-between py-4 text-base font-bold text-[#111111]"
                      onClick={() => setMobileOpen(false)}>
                      {entry.label}
                    </Link>
                    {entry.dropdown && (
                      <div className="mb-3 grid grid-cols-2 gap-1.5">
                        {entry.dropdown.items.map((item) => (
                          <Link key={item.title} href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl bg-[#F5F5F3] p-2.5 transition hover:bg-[#EEEDE9]">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0037D2]/8">
                              <item.icon className="h-4 w-4 text-[#0037D2]" strokeWidth={2} />
                            </span>
                            <span className="text-[12px] font-semibold text-[#111111]">{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="py-4">
                  <Link href={ctaHref} onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0037D2]">
                    {ctaText}
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
