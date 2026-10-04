/**
 * Copy for the two About pages:
 *   /about                 — the Successbrew story (src/components/AboutPageClient.tsx)
 *   /about/sourabh-goyal   — the founder's profile (src/components/FounderProfilePageClient.tsx)
 *
 * Community numbers match the Community page (8,000+ members, 200+ events,
 * 150K+ reach, 1M by 2030). Founder numbers live in ./founder-branding.ts.
 */

export const FOUNDER_PROFILE_HREF = "/about/sourabh-goyal";

export const COMPANY_STATS = [
  { value: "8,000+", label: "Community members" },
  { value: "150K+", label: "Monthly reach" },
  { value: "200+", label: "Events hosted" },
  { value: "1M", label: "Entrepreneurs by 2030" },
];

export const MILESTONES = [
  { year: "2018", title: "First idea", desc: "The initial blueprint, sketched over late-night conversations about why talent stays invisible." },
  { year: "2019", title: "First event", desc: "A small gathering of 30 people. No sponsors. No stage. Just raw conviction." },
  { year: "2020", title: "Community launch", desc: "The movement went online. One WhatsApp group became ten — founders, students and creators, all connected." },
  { year: "2021", title: "Growth phase", desc: "500 members. Monthly events. Guest speakers. Successbrew became the word people said when they wanted their people." },
  { year: "2022", title: "Expansion", desc: "Chapters in three cities. The podcast launched. 2,000 members. The first founders closed pre-seed rounds." },
  { year: "2023", title: "Ecosystem born", desc: "Brand, studio, platform — formalised. Not just a community: an ecosystem, with a promise of 1M entrepreneurs by 2030." },
];

export const VALUES = [
  { title: "Community first", desc: "Nobody succeeds alone. We build together, celebrate together and lift each other up — always." },
  { title: "Relentless learning", desc: "Curiosity is the unfair advantage. We create resources and mentors that keep builders compounding." },
  { title: "Compound growth", desc: "Show up daily. Give generously. The results compound in ways you can't plan for." },
  { title: "Create opportunity", desc: "Don't wait for a seat at the table. Build the table. Then invite everyone else." },
  { title: "Servant leadership", desc: "The community is the hero, not the founder. Every decision is made with that belief at its centre." },
  { title: "Global impact", desc: "India-built, universally relevant. Our metric isn't followers — it's lives permanently changed." },
];

/** What Successbrew is today — each links to where it lives on the site. */
export const ECOSYSTEM = [
  { title: "Community", desc: "8,000+ founders, freelancers, creators, angels and VCs growing through shared opportunities.", href: "/community", cta: "Explore the community" },
  { title: "Content studio", desc: "Content, founder-led growth and launches for ambitious brands.", href: "/", cta: "See our services" },
  { title: "Podcast", desc: "Conversations with the people building India's startup story.", href: "/community/podcast", cta: "Listen in" },
  { title: "Events", desc: "Meetups, summits and demo days that turn strangers into collaborators.", href: "/community/events", cta: "Upcoming events" },
];

export const ROADMAP = [
  { title: "More cities", desc: "Successbrew chapters in 20+ Indian cities, so no ambitious person is limited by geography." },
  { title: "10K founders", desc: "Founders who found their co-founder, investor or first customer through this community." },
  { title: "Creator economy", desc: "A new wave of Indian creators building businesses and brands from their bedrooms." },
  { title: "Direct access", desc: "Fellowships and grants flowing straight to the people who deserve them — no gatekeepers." },
  { title: "Global stage", desc: "India's startup story on the world stage, with Successbrew alumni at the centre of it." },
];

/** Real community photos only (no social-media graphics). */
export const COMMUNITY_GALLERY = [
  { src: "/grid-images/IMG_9736.JPG", alt: "A packed Successbrew community event" },
  { src: "/grid-images/20220423062049_IMG_2072.JPG", alt: "Founders at an early Successbrew meetup" },
  { src: "/grid-images/Teach-2.jpg", alt: "A community selfie at a Successbrew evening" },
  { src: "/grid-images/IMG-20220514-WA0017.jpg", alt: "A roundtable conversation between founders" },
  { src: "/grid-images/service-page.jpg", alt: "An audience listening to a session" },
  { src: "/grid-images/IMG_6949.JPG", alt: "Members of the Successbrew community together" },
];

export const ORIGIN_STORY = [
  "Growing up, he saw classmates with extraordinary ideas — people who could have built companies, led movements, changed industries. Most of them never got the chance. Not because they lacked talent. Because they lacked access.",
  "He graduated in 2018. No startup ecosystem in his city. No community for first-time founders. No playbook for people who wanted to build but didn't know where to begin.",
  "So he did what any builder does when they can't find the room they need —",
];

/* ── Founder profile ───────────────────────────────────────────────────── */

export const FOUNDER = {
  name: "Sourabh Goyal",
  role: "Founder & Chief Brewer, Successbrew",
  intro:
    "Sourabh has spent years at the intersection of content, personal branding, community and entrepreneurship — building founder networks offline and helping leaders become visible online.",
  /** From Sourabh's own published quote card. */
  quote: "Teach what you do, not just what you know. That's what people trust.",
};

export const FOCUS_AREAS = [
  { title: "Personal branding", desc: "Helping founders and leaders turn what they know into positioning, content and a reputation that works before they enter the room." },
  { title: "Community building", desc: "Building Successbrew from a 30-person gathering into a community of 8,000+ founders, creators and investors." },
  { title: "Founder ecosystems", desc: "Bringing students, operators, creators and investors to the same table — and making that the normal thing." },
  { title: "Speaking & mentoring", desc: "On stage and in classrooms with incubators, universities and startup programmes across India." },
];

export const FOUNDER_GALLERY = [
  { src: "/grid-images/Sourabh-sir.jpg", alt: "Sourabh leading a session" },
  { src: "/grid-images/Teach-2.jpg", alt: "Sourabh taking a selfie with the community at an event" },
  { src: "/grid-images/Teach-3.jpg", alt: "Sourabh with founders at a HighLevel event" },
  { src: "/grid-images/IMG-20220315-WA0059.jpg", alt: "Sourabh with students and faculty after a session" },
];

export const LETTER = [
  "I didn't start Successbrew because I had it all figured out. I started it because I didn't — and I couldn't find anyone willing to help me figure it out either. The meetings I needed weren't happening. The introductions weren't being made. The rooms I needed to be in were closed to me.",
  "So I decided those rooms shouldn't exist in the first place. Not closed rooms. Open tables. Places where the student next to the investor next to the creator next to the operator is a completely normal thing.",
  "What I've learned is that opportunity isn't rare. Access is. And when you remove that barrier — even slightly — extraordinary things happen. Companies get built. Careers change direction. Ideas that would have died in someone's notebook find their way into the world.",
  "Successbrew is my commitment to keep removing that barrier. For every person who walks in unsure of where they belong and walks out knowing exactly who they are and what they're building.",
  "We're just getting started. And this is your invitation.",
];
