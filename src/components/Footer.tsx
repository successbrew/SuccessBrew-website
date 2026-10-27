/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SocialLinks, type SiteSettings } from "@/components/SocialLinks";
import { FooterMarquee, FooterRise, FooterWordmark } from "@/components/FooterMotion";

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
      { label: "Events", href: "/community/events" },
      { label: "Offers", href: "/community/offers" },
      { label: "Podcast", href: "/community/podcast" },
      { label: "Learning Hub", href: "/community#learning-hub" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Our Founder", href: "/about/sourabh-goyal" },
      { label: "Join the Mission", href: "/about#join" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
];

export function Footer({ siteSettings }: { siteSettings: SiteSettings }) {
  return (
    <footer className="relative overflow-hidden bg-ink text-background">
      {/* Brand signature: a blue→lime hairline across the top of every page's footer */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-accent" />
      <FooterMarquee />
      <FooterRise>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="mb-5 inline-block">
            <img src="/SB-logo.png" alt="Successbrew" className="h-10 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          </Link>
          <p className="mt-2 max-w-xs text-sm text-background/60">India&apos;s startup ecosystem — community, content studio, podcast, learning and events.</p>
          <p className="mt-4 text-sm font-semibold text-accent">#IBrewMyOwnSuccess</p>
          <SocialLinks settings={siteSettings} showLabel className="mt-6 text-background/70 hover:text-background" />
        </div>
        {COLUMNS.map(({ title, links }) => (
          <div key={title}>
            <div className="text-xs font-semibold uppercase tracking-[0.1em] text-background/50">{title}</div>
            <ul className="mt-5 space-y-3 text-sm">
              {links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group/link relative inline-flex items-center gap-1.5 text-background/80 transition-colors hover:text-accent">
                    <span className="relative">
                      {link.label}
                      <span aria-hidden="true" className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover/link:scale-x-100" />
                    </span>
                    <span aria-hidden="true" className="-translate-x-1 text-xs opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      </FooterRise>
      <FooterWordmark />
      <div className="border-t border-background/10">
        <div className="mx-auto px-6 py-6 text-xs text-background/50 lg:px-10">
          © 2026 Successbrew Studio. Building 1M entrepreneurs by 2030.
        </div>
      </div>
    </footer>
  );
}
