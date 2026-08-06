import type { EventCategoryValue } from "./event-categories";

export interface EventPillar {
  slug: string;
  category: EventCategoryValue;
  icon: string;
  title: string;
  tagline: string;
  description: string;
}

export const EVENT_PILLARS: EventPillar[] = [
  {
    slug: "revenue-room",
    category: "INVESTORS",
    icon: "💰",
    title: "The Revenue Room",
    tagline: "Where founders meet capital.",
    description:
      "Closed-door sessions connecting ambitious founders with angels, VCs and family offices actively writing cheques.",
  },
  {
    slug: "d2c-round-table",
    category: "D2C",
    icon: "🛍️",
    title: "D2C Round Table",
    tagline: "Consumer brands, unfiltered.",
    description:
      "Founders and operators building India's next generation of D2C and consumer brands, trading playbooks on growth, retention and scale.",
  },
  {
    slug: "tech-integrate",
    category: "TECH_INTEGRATE",
    icon: "🔌",
    title: "Tech Integrated — Be the API",
    tagline: "Builders shipping the future.",
    description:
      "A room for tech founders and engineers building AI, SaaS and deep-tech products that plug straight into how the world works.",
  },
  {
    slug: "wellness-retreats",
    category: "RETREATS",
    icon: "🌴",
    title: "The Brew Wellness Retreats",
    tagline: "Deep work meets deep rest.",
    description:
      "Curated offsites blending wellness, reflection and genuine connection — where the best ideas and friendships are born.",
  },
];

export function getEventPillarBySlug(slug: string) {
  return EVENT_PILLARS.find((p) => p.slug === slug);
}

export function getEventPillarByCategory(category: string) {
  return EVENT_PILLARS.find((p) => p.category === category);
}
