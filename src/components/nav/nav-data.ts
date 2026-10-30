import {
  Clapperboard, Settings, Sparkles, MessageCircle, Layers, User,
  Globe, Gift, Calendar, Mic, Users, BookOpen, Newspaper,
  FolderOpen, GraduationCap, Handshake, BookText, Star,
  Rocket, type LucideIcon,
} from "lucide-react";

/**
 * Everything the site navigation shows — the desktop mega-menu, the phone menu
 * and the ⌘K search palette all read from here.
 *
 * Adding a page: drop an item into the right group. A group can hold any
 * number of items and a section any number of groups; the menu lays itself
 * out. Example, when the Playbooks page ships, add to Community → "Learn":
 *
 *   { icon: BookMarked, title: "Playbooks", desc: "Step-by-step frameworks", href: "/community/playbooks", badge: "New" },
 *
 * Use `status: "soon"` for a page that's announced but not live yet; without an
 * `href` it shows as a non-clickable "Soon" row.
 */

export interface NavItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  href?: string;
  badge?: "New";
  status?: "soon";
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export type NavTheme = "blue" | "lime" | "ink" | "navy";

export interface NavSection {
  label: string;
  href: string;
  /** Small "New" marker on the top-level button. */
  badge?: "New";
  groups?: NavGroup[];
  theme: NavTheme;
  /** What the preview card shows before you hover a link. */
  feature?: { eyebrow: string; stat: string; statLabel: string; sub: string; ctaText: string; ctaHref: string };
  footer?: { left: { label: string; href: string }; right: { label: string; href: string } };
}

export const NAV: NavSection[] = [
  {
    label: "Services",
    href: "/",
    theme: "blue",
    groups: [
      {
        title: "What we offer",
        items: [
          { icon: Clapperboard, title: "What We Do", desc: "Creator-led launches for SaaS and AI products", href: "/#services" },
          { icon: User, title: "Founder Led Growth", desc: "Personal branding that opens doors for founders", href: "/personal-branding" },
          { icon: Layers, title: "How We Engage", desc: "A single launch or a monthly partnership", href: "/#engagements" },
        ],
      },
      {
        title: "Proof",
        items: [
          { icon: Sparkles, title: "Selected Work", desc: "Case studies and the numbers behind them", href: "/case-studies" },
          { icon: MessageCircle, title: "Client Voices", desc: "What founders say after working with us", href: "/testimonials" },
        ],
      },
      {
        title: "Approach",
        items: [
          { icon: Settings, title: "Our Process", desc: "How an engagement runs, step by step", href: "/#process" },
        ],
      },
    ],
    feature: { eyebrow: "Studio · Podcast · Growth", stat: "50+", statLabel: "Brands built", sub: "From zero to visibility.", ctaText: "Free consultation", ctaHref: "/#cta" },
    footer: { left: { label: "All services", href: "/#services" }, right: { label: "Start a project", href: "/#cta" } },
  },
  {
    label: "Community",
    href: "/community",
    theme: "lime",
    groups: [
      {
        title: "Belong",
        items: [
          { icon: Globe, title: "Ecosystem", desc: "The six pillars of Successbrew", href: "/community#ecosystem" },
          { icon: Users, title: "Stories", desc: "Member wins, in their own words", href: "/community/testimonials" },
          { icon: Gift, title: "Offers", desc: "What every member unlocks", href: "/community/offers" },
        ],
      },
      {
        title: "Show up",
        items: [
          { icon: Calendar, title: "Events", desc: "Rooms, round tables and retreats", href: "/community/events" },
          { icon: Mic, title: "Podcast", desc: "Raw conversations with founders", href: "/community/podcast" },
        ],
      },
      {
        title: "Learn",
        items: [
          { icon: Newspaper, title: "Blogs", desc: "Ideas and playbooks from the team", href: "/community/blogs", badge: "New" },
          { icon: BookOpen, title: "Learning Hub", desc: "Playbooks, templates and ebooks", href: "/community#learning-hub" },
        ],
      },
    ],
    feature: { eyebrow: "India's startup community", stat: "8K+", statLabel: "Members", sub: "Free to join. Always.", ctaText: "Apply free", ctaHref: "/apply?source=community" },
    footer: { left: { label: "Browse the community", href: "/community" }, right: { label: "Apply to join", href: "/apply?source=community" } },
  },
  {
    label: "Courses",
    href: "/courses",
    theme: "ink",
    groups: [
      {
        title: "Launching soon",
        items: [
          { icon: FolderOpen, title: "Course Categories", desc: "Every track, in one place", href: "/courses", status: "soon" },
          { icon: GraduationCap, title: "Featured Courses", desc: "Hand-picked by the team", href: "/courses", status: "soon" },
          { icon: Handshake, title: "Mentor Network", desc: "Operators who've done it", href: "/courses", status: "soon" },
          { icon: BookText, title: "Resource Library", desc: "Templates and playbooks", href: "/courses", status: "soon" },
          { icon: Star, title: "Success Stories", desc: "Learners who shipped", href: "/courses", status: "soon" },
        ],
      },
    ],
    feature: { eyebrow: "Coming soon", stat: "Soon", statLabel: "In the works", sub: "Courses, mentors and playbooks are on the way.", ctaText: "Get notified", ctaHref: "/courses" },
    footer: { left: { label: "Learn more", href: "/courses" }, right: { label: "Apply to join", href: "/apply?source=community" } },
  },
  {
    label: "About",
    href: "/about",
    theme: "navy",
    groups: [
      {
        title: "Successbrew",
        items: [
          { icon: BookOpen, title: "Our Story", desc: "How it began in 2018, and where it's going", href: "/about" },
          { icon: Rocket, title: "Join the Mission", desc: "1M entrepreneurs by 2030", href: "/about#join" },
        ],
      },
      {
        title: "People",
        items: [
          { icon: User, title: "Sourabh Goyal", desc: "Founder & Chief Brewer", href: "/about/sourabh-goyal" },
        ],
      },
    ],
    feature: { eyebrow: "The Successbrew story", stat: "2018", statLabel: "Founded", sub: "Building India's startup future.", ctaText: "Meet the founder", ctaHref: "/about/sourabh-goyal" },
    footer: { left: { label: "Our story", href: "/about" }, right: { label: "Join the mission", href: "/about#join" } },
  },
];

export const NAV_THEME: Record<NavTheme, { card: string; text: "light" | "dark"; chip: string }> = {
  blue: { card: "bg-[linear-gradient(150deg,#003CD1_0%,#0030A8_60%,#0B1640_100%)]", text: "light", chip: "bg-white/15 text-white" },
  lime: { card: "bg-[linear-gradient(150deg,#C6FF3A_0%,#E4FFA8_100%)]", text: "dark", chip: "bg-[#111111]/10 text-[#111111]" },
  ink: { card: "bg-[linear-gradient(150deg,#1A1A1A_0%,#111111_100%)]", text: "light", chip: "bg-white/10 text-white" },
  navy: { card: "bg-[linear-gradient(150deg,#0B1640_0%,#003CD1_100%)]", text: "light", chip: "bg-white/15 text-white" },
};

/** Every reachable page, flattened for the search palette. */
export function navIndex() {
  return NAV.flatMap((s) => [
    { section: s.label, group: "", title: s.label, desc: `${s.label} home`, href: s.href, icon: null as LucideIcon | null, soon: false },
    ...(s.groups ?? []).flatMap((g) =>
      g.items
        .filter((i) => i.href)
        .map((i) => ({ section: s.label, group: g.title, title: i.title, desc: i.desc, href: i.href!, icon: i.icon, soon: i.status === "soon" }))
    ),
  ]);
}
