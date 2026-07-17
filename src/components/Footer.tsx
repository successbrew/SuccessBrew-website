/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SocialLinks, type SiteSettings } from "@/components/SocialLinks";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Studio",
    links: [
      { label: "Services", href: "/" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Process", href: "/#process" },
      { label: "Testimonials", href: "/testimonials" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Community", href: "/community" },
      { label: "Events", href: "/community#events" },
      { label: "Podcast", href: "/community#podcast" },
      { label: "Learning Hub", href: "/community#learning-hub" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Join the Mission", href: "/about#join" },
    ],
  },
];

export function Footer({ siteSettings }: { siteSettings: SiteSettings }) {
  return (
    <footer className="bg-ink text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="mb-5 inline-block">
            <img src="/SB-logo.png" alt="Successbrew" className="h-10 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          </Link>
          <p className="mt-2 max-w-xs text-sm text-background/60">India&apos;s startup ecosystem — community, content studio, podcast, learning and events.</p>
          <SocialLinks settings={siteSettings} showLabel className="mt-6 text-background/70 hover:text-background" />
        </div>
        {COLUMNS.map(({ title, links }) => (
          <div key={title}>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-background/50">{title}</div>
            <ul className="mt-5 space-y-3 text-sm">
              {links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-background/80 transition hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto px-6 py-6 text-xs text-background/50 lg:px-10">
          © 2026 Successbrew Studio. Building 1L entrepreneurs by 2030.
        </div>
      </div>
    </footer>
  );
}
