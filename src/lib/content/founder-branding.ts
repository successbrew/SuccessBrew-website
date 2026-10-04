/**
 * Copy and figures for the Founder Personal Branding landing page
 * (/personal-branding, src/components/FounderBrandingPageClient.tsx).
 *
 * Numbers here come from the page brief and are shown publicly as proof —
 * re-check them against the latest verified figures before publishing.
 */

export const BOOKING_URL = "https://ntis.in/7oApLV";

export const PROOF_STATS = [
  { value: "17+", label: "founders positioned" },
  { value: "100+", label: "creators and leaders worked with" },
  { value: "5+", label: "years in the content, community and founder ecosystem" },
];

export const FOUNDER_STATS = [
  { value: "142K+", label: "LinkedIn followers" },
  { value: "50M+", label: "views" },
  { value: "100+", label: "community meetups" },
  { value: "5+", label: "years in the ecosystem" },
];

export const ECOSYSTEMS = [
  "Headstart",
  "Huddle Global by Kerala Startup Mission",
  "I-Hub Gujarat",
  "Aspire for Her",
  "Chandigarh University",
  "Punjab Engineering College",
  "Skill Circle",
];

export const SYSTEM_STAGES = [
  { key: "Position", question: "What should you be known for?", detail: "Personal positioning, audience, differentiation, category and intellectual territory." },
  { key: "Narrative", question: "What should people remember about you?", detail: "Founder stories, experiences, beliefs, failures, wins and opinions." },
  { key: "Content", question: "What should you say consistently?", detail: "Content pillars, thought leadership, founder stories, educational content and opinions." },
  { key: "Distribution", question: "Where should your ideas travel?", detail: "LinkedIn, Instagram, YouTube, podcasts, collaborations, communities and media." },
  { key: "Authority", question: "What should your visibility create?", detail: "Customers. Investors. Talent. Partnerships. Speaking opportunities. Media." },
];

/** Kept deliberately short — what we actually deliver, nothing padded. */
export const CAPABILITIES = [
  { title: "Positioning", desc: "We define what you should be known for — and the story behind it." },
  { title: "Content", desc: "One founder shoot a month, turned into short-form video and LinkedIn posts." },
  { title: "Distribution", desc: "Published where your audience is, and amplified through our creator network." },
]

export const ONE_DAY_FLOW = [
  "Content strategy",
  "Topic research",
  "Founder shoot",
  "15–20 short-form videos",
  "LinkedIn content",
  "Instagram",
  "YouTube",
  "Distribution",
];

/**
 * Video testimonials — add real ones here (YouTube video id + details) and
 * the section appears automatically. Leave empty to hide it.
 */
export const VIDEO_TESTIMONIALS: {
  youtubeId: string;
  name: string;
  designation: string;
  company: string;
  takeaway: string;
}[] = [];

/**
 * Audio testimonials — add real recordings (an mp3 in /public or a URL) and
 * the section appears automatically. Leave empty to hide it.
 */
export const AUDIO_TESTIMONIALS: {
  audioUrl: string;
  name: string;
  designation: string;
  company: string;
  takeaway: string;
}[] = [];
