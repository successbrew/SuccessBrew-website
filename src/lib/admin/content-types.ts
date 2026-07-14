export const CONTENT_TYPE_NAV_GROUPS = [
  {
    label: "Services Page",
    items: [
      { label: "Services", href: "/admin/services" },
      { label: "Process Steps", href: "/admin/process-steps" },
      { label: "Case Studies", href: "/admin/case-studies" },
      { label: "Testimonials", href: "/admin/testimonials" },
      { label: "Stats", href: "/admin/stats" },
      { label: "Brand Partners", href: "/admin/brand-partners" },
    ],
  },
  {
    label: "Community Page",
    items: [
      { label: "Community Events", href: "/admin/community-events" },
      { label: "Podcast Episodes", href: "/admin/podcast-episodes" },
      { label: "Community Wins", href: "/admin/community-wins" },
      { label: "Community Posts", href: "/admin/community-posts" },
      { label: "Community Partners", href: "/admin/community-partners" },
      { label: "Community Members", href: "/admin/community-members" },
    ],
  },
  {
    label: "Blog",
    items: [{ label: "Blog Posts", href: "/admin/blog" }],
  },
  {
    label: "Settings",
    items: [{ label: "Social Links", href: "/admin/settings" }],
  },
] as const;
