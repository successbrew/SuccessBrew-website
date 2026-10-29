"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Check, Link2 } from "lucide-react";
import type { TocEntry } from "@/lib/blog-format";

/** Thin lime bar along the top edge showing how far through the article you are. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-[#C6FF3A]" />;
}

/** Sticky "In this post" list; marks the section currently being read. */
export function TableOfContents({ items }: { items: TocEntry[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-20% 0px -70% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="In this post">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111111]/40">In this post</p>
      <ol className="space-y-1 border-l border-[#111111]/10">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}
              className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors ${active === item.id ? "border-[#003CD1] font-semibold text-[#111111]" : "border-transparent text-[#111111]/50 hover:text-[#111111]"}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Share links (plain URLs, no third-party scripts) plus copy-link. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noreferrer noopener"
          className="rounded-full border border-[#111111]/15 px-3.5 py-1.5 text-xs font-semibold text-[#111111]/70 transition hover:border-[#003CD1] hover:text-[#003CD1]">
          {l.label}
        </a>
      ))}
      <button type="button"
        onClick={async () => {
          try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#111111]/15 px-3.5 py-1.5 text-xs font-semibold text-[#111111]/70 transition hover:border-[#003CD1] hover:text-[#003CD1]">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
