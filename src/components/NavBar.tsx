/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { NAV, NAV_THEME, type NavGroup, type NavItem, type NavSection } from "@/components/nav/nav-data";
import { CommandPalette } from "@/components/nav/CommandPalette";

// Hover button — scales up slightly so the cursor's position over it reads clearly, no cursor-chasing wobble
function MagneticLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return (
    <motion.a href={href} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: "easeOut" }} className={className}>
      {children}
    </motion.a>
  );
}

const E = [0.22, 1, 0.36, 1] as const;

// Shortcut label: ⌘K on Apple devices, Ctrl K elsewhere. Read via an external
// store so the server render ("Ctrl") and the client never disagree mid-hydration.
const noopSubscribe = () => () => {};
function useIsApple() {
  return useSyncExternalStore(noopSubscribe, () => /Mac|iPhone|iPad/.test(navigator.platform), () => false);
}

function Badge({ item, dark = false }: { item: Pick<NavItem, "badge" | "status">; dark?: boolean }) {
  if (item.status === "soon") {
    return <span className={`rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide ${dark ? "bg-white/15 text-white/80" : "bg-[#111111]/8 text-[#111111]/50"}`}>Soon</span>;
  }
  if (item.badge === "New") {
    return <span className="rounded-full bg-[#C6FF3A] px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-[#111111]">New</span>;
  }
  return null;
}

/* ── Mega panel content for one section ─────────────────────────────────── */

function MegaContent({ section, isCurrent, onNavigate }: {
  section: NavSection;
  isCurrent: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const [hovered, setHovered] = useState<{ item: NavItem; group: NavGroup } | null>(null);
  const theme = NAV_THEME[section.theme];
  const light = theme.text === "light";
  const groups = section.groups ?? [];
  const cols = Math.min(groups.length, 3);

  return (
    <div className="grid lg:grid-cols-[1fr_240px] xl:grid-cols-[1fr_300px]">
      <div className="flex flex-col">
        <div className="grid gap-x-4 gap-y-6 p-5 xl:gap-x-6 xl:p-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111111]/40">{g.title}</p>
              <ul className="space-y-0.5">
                {g.items.map((item) => {
                  const here = item.href ? isCurrent(item.href) : false;
                  const inner = (
                    <>
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${here ? "bg-[#003CD1] text-white" : "bg-[#003CD1]/8 text-[#003CD1] group-hover:bg-[#003CD1] group-hover:text-white"}`}>
                        <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111111]">
                          <span className="truncate">{item.title}</span>
                          <Badge item={item} />
                        </span>
                        {here ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#003CD1]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#003CD1]" />You&apos;re here
                          </span>
                        ) : (
                          <span className="line-clamp-2 text-[11px] leading-snug text-[#111111]/45">{item.desc}</span>
                        )}
                      </span>
                    </>
                  );
                  const rowClass = `group flex items-center gap-3 rounded-xl p-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#003CD1]/40 ${here ? "bg-[#003CD1]/[0.05]" : "hover:bg-[#F5F5F3] focus-visible:bg-[#F5F5F3]"}`;
                  return (
                    <li key={item.title} onMouseEnter={() => setHovered({ item, group: g })} onFocus={() => setHovered({ item, group: g })}>
                      {item.href ? (
                        <Link href={item.href} onClick={onNavigate} aria-current={here ? "page" : undefined} className={rowClass}>{inner}</Link>
                      ) : (
                        <div aria-disabled className={`${rowClass} cursor-default opacity-70`}>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        {section.footer && (
          <div className="mt-auto flex items-center justify-between border-t border-[#111111]/5 bg-[#F9F9F8] px-6 py-3">
            <Link href={section.footer.left.href} onClick={onNavigate} className="text-[12px] font-medium text-[#111111]/50 transition hover:text-[#111111]">
              {section.footer.left.label} →
            </Link>
            <Link href={section.footer.right.href} onClick={onNavigate}
              className="rounded-full bg-[#003CD1] px-3.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#0028a8]">
              {section.footer.right.label}
            </Link>
          </div>
        )}
      </div>

      {/* Live preview — follows whatever you're pointing at, in the section's colour. */}
      <div className={`relative hidden overflow-hidden p-6 lg:block ${theme.card}`}>
        <div aria-hidden className={`pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full blur-2xl ${light ? "bg-[#C6FF3A]/25" : "bg-[#003CD1]/20"}`} />
        <AnimatePresence mode="wait" initial={false}>
          {hovered ? (
            <motion.div key={hovered.item.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: E }} className="relative flex h-full flex-col">
              <span className={`grid h-14 w-14 place-items-center rounded-2xl ${theme.chip}`}>
                <hovered.item.icon className="h-7 w-7" strokeWidth={1.8} />
              </span>
              <p className={`mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] ${light ? "text-white/55" : "text-[#111111]/50"}`}>{section.label} · {hovered.group.title}</p>
              <p className={`mt-2 flex items-center gap-2 text-2xl font-black leading-tight ${light ? "text-white" : "text-[#111111]"}`}>
                {hovered.item.title} <Badge item={hovered.item} dark={light} />
              </p>
              <p className={`mt-2 text-sm leading-relaxed ${light ? "text-white/70" : "text-[#111111]/65"}`}>{hovered.item.desc}</p>
              {hovered.item.href && (
                <Link href={hovered.item.href} onClick={onNavigate}
                  className={`mt-auto inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${light ? "bg-white text-[#111111] hover:bg-[#C6FF3A]" : "bg-[#111111] text-white hover:bg-[#003CD1]"}`}>
                  Open page <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </motion.div>
          ) : section.feature ? (
            <motion.div key="feature" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              className="relative flex h-full flex-col">
              <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${light ? "text-white/55" : "text-[#111111]/50"}`}>{section.feature.eyebrow}</p>
              <p className={`mt-4 text-5xl font-black leading-none tracking-tight ${light ? "text-white" : "text-[#111111]"}`}>{section.feature.stat}</p>
              <p className={`mt-1 text-sm font-bold ${light ? "text-white" : "text-[#111111]"}`}>{section.feature.statLabel}</p>
              <p className={`mt-3 text-sm leading-relaxed ${light ? "text-white/65" : "text-[#111111]/60"}`}>{section.feature.sub}</p>
              <Link href={section.feature.ctaHref} onClick={onNavigate}
                className={`mt-auto inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${light ? "bg-white text-[#111111] hover:bg-[#C6FF3A]" : "bg-[#111111] text-white hover:bg-[#003CD1]"}`}>
                {section.feature.ctaText} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── NavBar ─────────────────────────────────────────────────────────────── */

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
  ctaText = "Apply to Join",
  ctaHref = "/apply?source=community",
  activePage,
}: NavBarProps) {
  const reduced = usePrefersReducedMotion();
  const isApple = useIsApple();
  const pathname = usePathname();
  // `dir` makes the panel's content slide the way the pointer moved.
  const [menu, setMenu] = useState<{ label: string | null; dir: number }>({ label: null, dir: 1 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(activePage ?? null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const zoneRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  // A tap opens a menu first (touch has no hover); a second tap follows the link.
  const lastPointer = useRef<string>("mouse");

  const open = menu.label;
  const openSection = NAV.find((s) => s.label === open && s.groups?.length);
  const indexOf = (label: string | null) => NAV.findIndex((s) => s.label === label);
  const openMenu = (label: string | null) =>
    setMenu((m) => (m.label === label ? m : { label, dir: indexOf(label) >= indexOf(m.label) ? 1 : -1 }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // ⌘K / Ctrl+K opens page search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMenu((m) => ({ ...m, label: null }));
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on outside click/tap, or Escape (focus returns to the pill).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(e.target as Node)) setMenu((m) => ({ ...m, label: null }));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const pill = zoneRef.current?.querySelector<HTMLElement>(`[data-nav-pill="${open}"]`);
      setMenu((m) => ({ ...m, label: null }));
      pill?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The panel animates its height to fit whichever section is showing.
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPanelHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [openSection]);

  const handleEnter = (label: string) => {
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => openMenu(label), open ? 0 : 70);
  };
  const handleLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setMenu((m) => ({ ...m, label: null })), 180);
  };
  const close = () => setMenu((m) => ({ ...m, label: null }));

  /** True when this item's page (and, for #anchors, section) is the one on screen. */
  const isCurrent = (href: string) => {
    const [path, hash] = href.split("#");
    const base = path || "/";
    if (hash) return pathname === base && activeSection === hash;
    return pathname === base || (base !== "/" && pathname.startsWith(`${base}/`));
  };

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const isDark = variant === "dark";
  const headerBg =
    isDark
      ? scrolled ? "bg-[#111111]/95 backdrop-blur-xl border-white/10" : "bg-[#111111]/40 backdrop-blur-md border-white/10"
      : scrolled ? "bg-[#F2ECDD]/95 backdrop-blur-xl border-[#111111]/5" : "bg-[#F2ECDD]/65 backdrop-blur-md border-[#111111]/5";
  const logoFilter = isDark ? "brightness(0) invert(1)" : "contrast(1.5) brightness(1.1)";
  const logoBlend = isDark ? undefined : ("multiply" as const);
  const navTextColor = isDark ? "text-white/65 hover:text-white" : "text-[#111111]/65 hover:text-[#111111]";
  const activeColor = isDark ? "text-white" : "text-[#111111]";
  const ctaBg = isDark ? "bg-white text-[#111111] hover:bg-[#C6FF3A]" : "bg-[#111111] text-white hover:bg-[#003CD1]";
  const chevronColor = isDark ? "text-white/40" : "text-[#111111]/30";
  const navPillBorder = isDark ? "border-white/15 bg-white/5" : "border-[#111111]/10 bg-white/60";
  const iconBtn = isDark ? "border-white/15 text-white/70 hover:text-white hover:bg-white/10" : "border-[#111111]/10 bg-white/60 text-[#111111]/60 hover:text-[#111111] hover:bg-white";

  return (
    <>
      {/* Dims the page while a menu is open so the panel reads clearly. */}
      <AnimatePresence>
        {openSection && (
          <motion.div key="nav-dim" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={close} className="fixed inset-0 top-16 z-40 hidden bg-[#111111]/20 lg:block" />
        )}
      </AnimatePresence>

      <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${headerBg}`}>
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Logo */}
          <Link href="/" className="inline-flex shrink-0 items-center">
            <img src="/SB-logo.png" alt="Successbrew"
              style={{ height: 36, width: "auto", objectFit: "contain", mixBlendMode: logoBlend, filter: logoFilter }} />
          </Link>

          {/* Pills + mega panel share one hover/focus zone. */}
          <div ref={zoneRef} className="contents"
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) close(); }}>
            {/* Desktop nav — from lg it sits between the logo and CTA; on xl it's pinned
                to the true centre. Hover only reacts to a real mouse: touch fires fake
                hover events right before its click. */}
            <nav aria-label="Main" className="hidden items-center gap-1.5 lg:flex xl:absolute xl:left-1/2 xl:gap-2 xl:-translate-x-1/2"
              onPointerLeave={(e) => { if (e.pointerType === "mouse") handleLeave(); }}>
              {NAV.map((entry) => {
                const hasMenu = !!entry.groups?.length;
                return (
                  <div key={entry.label} className="relative" onPointerEnter={(e) => { if (e.pointerType === "mouse") { if (hasMenu) handleEnter(entry.label); else handleLeave(); } }}>
                    <Link
                      href={entry.href}
                      data-nav-pill={entry.label}
                      aria-haspopup={hasMenu ? "true" : undefined}
                      aria-expanded={hasMenu ? open === entry.label : undefined}
                      aria-current={activePage === entry.label ? "page" : undefined}
                      onPointerDown={(e) => { lastPointer.current = e.pointerType; }}
                      onClick={(e) => {
                        if (hasMenu && lastPointer.current === "touch" && open !== entry.label) {
                          e.preventDefault();
                          openMenu(entry.label);
                        } else {
                          close();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!hasMenu) return;
                        if (e.key === "ArrowDown" || (e.key === " " && open !== entry.label)) {
                          e.preventDefault();
                          openMenu(entry.label);
                          requestAnimationFrame(() => requestAnimationFrame(() => zoneRef.current?.querySelector<HTMLElement>("[data-mega] a")?.focus()));
                        }
                      }}
                      className={`relative inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003CD1]/50
                        ${navPillBorder} ${activePage === entry.label ? activeColor : navTextColor}`}
                    >
                      {(activePage === entry.label || open === entry.label) && (
                        <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full"
                          style={{ background: isDark ? "rgba(255,255,255,0.14)" : "rgba(17,17,17,0.08)" }}
                          transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                      )}
                      <span className="relative z-10">{entry.label}</span>
                      {hasMenu && (
                        <motion.span animate={{ rotate: open === entry.label ? 180 : 0 }} transition={{ duration: 0.2 }} className={`relative z-10 ${chevronColor}`}>
                          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </motion.span>
                      )}
                      {entry.badge && (
                        <span aria-label="New" className="absolute -right-0.5 -top-0.5 z-10 h-2.5 w-2.5 rounded-full bg-[#C6FF3A] ring-2 ring-[#F2ECDD]" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* One panel for every section: it morphs height and slides its content
                in the direction you moved, instead of separate pop-ups per pill. */}
            <AnimatePresence>
              {openSection && (
                <motion.div key="mega"
                  initial={reduced ? false : { opacity: 0, y: -8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985, transition: { duration: 0.14 } }}
                  transition={{ duration: 0.22, ease: E }}
                  style={{ transformOrigin: "top center" }}
                  className="absolute inset-x-6 top-full z-50 hidden pt-3 lg:block lg:inset-x-10"
                  onPointerEnter={(e) => { if (e.pointerType === "mouse") clearTimeout(closeTimer.current); }}
                  onPointerLeave={(e) => { if (e.pointerType === "mouse") handleLeave(); }}>
                  <motion.div
                    data-mega
                    animate={{ height: panelHeight ?? "auto" }}
                    transition={reduced ? { duration: 0 } : { duration: 0.32, ease: E }}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                      const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("a"));
                      const i = links.indexOf(document.activeElement as HTMLElement);
                      e.preventDefault();
                      links[(i + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length]?.focus();
                    }}
                    className="overflow-hidden rounded-3xl border border-[#111111]/8 bg-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.35)]">
                    <div ref={measureRef} className="relative">
                      <div className="h-[3px] bg-gradient-to-r from-[#003CD1] via-[#003CD1] to-[#C6FF3A]" />
                      <AnimatePresence mode="popLayout" initial={false} custom={menu.dir}>
                        <motion.div key={openSection.label} custom={menu.dir}
                          variants={{
                            enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 48 }),
                            center: { opacity: 1, x: 0 },
                            exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -48 }),
                          }}
                          initial="enter" animate="center" exit="exit"
                          transition={{ duration: 0.26, ease: E }}>
                          <MegaContent section={openSection} isCurrent={isCurrent} onNavigate={close} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search + CTA + hamburger */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { close(); setPaletteOpen(true); }}
              aria-label={`Search pages (${isApple ? "⌘" : "Ctrl"} K)`}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-2.5 text-xs font-semibold transition xl:px-3 ${iconBtn}`}>
              <Search className="h-4 w-4" />
              <span className="hidden xl:inline">Search</span>
              <kbd className={`hidden rounded-md border px-1.5 py-px text-[10px] xl:inline ${isDark ? "border-white/20" : "border-[#111111]/12"}`}>{isApple ? "⌘" : "Ctrl"} K</kbd>
            </button>
            <MagneticLink href={ctaHref}
              className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:inline-flex sm:px-5 sm:py-2.5 sm:text-sm ${ctaBg}`}>
              {ctaText}
            </MagneticLink>
            <button
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition lg:hidden
                ${isDark ? "text-white/70 hover:bg-white/8 hover:text-white" : "text-[#111111]/60 hover:bg-[#111111]/5 hover:text-[#111111]"}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
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

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {/* ── Mobile / tablet menu: collapsible sections, search on top ───────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div key="panel"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: E }}
              className="fixed inset-x-3 top-[72px] z-50 overflow-y-auto rounded-3xl border border-[#111111]/10 bg-white shadow-2xl lg:hidden"
              style={{ maxHeight: "calc(100dvh - 96px)" }}>
              <div className="p-4">
                <button type="button" onClick={() => { setMobileOpen(false); setPaletteOpen(true); }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-[#F5F5F3] px-4 py-3 text-left text-sm text-[#111111]/50">
                  <Search className="h-4 w-4" /> Search pages…
                </button>
              </div>
              <nav aria-label="Mobile" className="px-4 pb-2">
                {NAV.map((entry) => {
                  const hasMenu = !!entry.groups?.length;
                  const expanded = mobileSection === entry.label;
                  const current = activePage === entry.label;
                  return (
                    <div key={entry.label} className="border-b border-[#111111]/5 last:border-0">
                      {hasMenu ? (
                        <button type="button" aria-expanded={expanded} onClick={() => setMobileSection(expanded ? null : entry.label)}
                          className={`flex w-full items-center justify-between py-4 text-base font-bold ${current ? "text-[#003CD1]" : "text-[#111111]"}`}>
                          {entry.label}
                          <ChevronDown className={`h-4 w-4 text-[#111111]/40 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                        </button>
                      ) : (
                        <Link href={entry.href} onClick={() => setMobileOpen(false)} aria-current={current ? "page" : undefined}
                          className={`flex items-center justify-between py-4 text-base font-bold ${current ? "text-[#003CD1]" : "text-[#111111]"}`}>
                          <span className="flex items-center gap-2">{entry.label}{entry.badge && <Badge item={{ badge: entry.badge }} />}</span>
                          <ArrowRight className="h-4 w-4 text-[#111111]/30" />
                        </Link>
                      )}
                      <AnimatePresence initial={false}>
                        {hasMenu && expanded && (
                          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: E }} className="overflow-hidden">
                            <div className="space-y-4 pb-4">
                              <Link href={entry.href} onClick={() => setMobileOpen(false)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003CD1]">
                                {entry.label} home <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                              {entry.groups!.map((g) => (
                                <div key={g.title}>
                                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111111]/40">{g.title}</p>
                                  <div className="grid gap-1.5 sm:grid-cols-2">
                                    {g.items.map((item) => {
                                      const here = item.href ? isCurrent(item.href) : false;
                                      const inner = (
                                        <>
                                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#003CD1]/8">
                                            <item.icon className="h-4 w-4 text-[#003CD1]" strokeWidth={2} />
                                          </span>
                                          <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111111]">{item.title}<Badge item={item} /></span>
                                            <span className="block truncate text-[11px] text-[#111111]/45">{item.desc}</span>
                                          </span>
                                        </>
                                      );
                                      const cls = `flex items-center gap-2.5 rounded-xl p-2.5 transition ${here ? "bg-[#003CD1]/10 ring-1 ring-[#003CD1]/30" : "bg-[#F5F5F3] hover:bg-[#EEEDE9]"}`;
                                      return item.href ? (
                                        <Link key={item.title} href={item.href} onClick={() => setMobileOpen(false)} aria-current={here ? "page" : undefined} className={cls}>{inner}</Link>
                                      ) : (
                                        <div key={item.title} aria-disabled className={`${cls} opacity-70`}>{inner}</div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                <div className="py-4">
                  <Link href={ctaHref} onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#003CD1]">
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
