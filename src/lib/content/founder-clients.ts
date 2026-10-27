/**
 * Founders and leaders we've built with — shown as the portrait wall on
 * /personal-branding. `work` is what Successbrew actually did for them.
 *
 * Photos: drop a square headshot at public/founder-branding/people/<slug>.png
 * (a background-removed PNG gives the cleanest result — every portrait then
 * sits on the same brand backdrop) and set `photo` to that path. Until then the
 * card shows a monogram on the same backdrop.
 */
export type FounderClient = {
  slug: string;
  name: string;
  linkedin: string;
  /** Optional one-liner, only where we know it for sure. */
  role?: string;
  work: string[];
  photo?: string;
};

export const FOUNDER_CLIENTS: FounderClient[] = [
  {
    slug: "aaira-kaurr",
    name: "Aaira Kaurr",
    linkedin: "https://www.linkedin.com/in/aairakaurr/",
    role: "Founder, SelfLove Jewels",
    work: ["Content shoots", "Editing", "Content management", "LinkedIn · Instagram · YouTube · Facebook"],
  },
  {
    slug: "geetanjali-gupta",
    name: "Geetanjali Gupta",
    linkedin: "https://www.linkedin.com/in/geetanjalig/",
    work: ["Profile design", "Content management"],
  },
  {
    slug: "dr-satyen-sharma",
    name: "Dr. Satyen Sharma",
    linkedin: "https://www.linkedin.com/in/dr-satyen-sharma-166328139/",
    work: ["LinkedIn + Instagram", "Content shoots", "Social media management"],
  },
  {
    slug: "prabhat-gupta",
    name: "Prabhat Gupta",
    linkedin: "https://www.linkedin.com/in/prabhat7gupta/",
    work: ["LinkedIn profile optimisation", "Content management"],
  },
  {
    slug: "pia-singh",
    name: "Pia Singh",
    linkedin: "https://www.linkedin.com/in/pia-singh/",
    work: ["Profile redesign", "Content consulting"],
  },
  {
    slug: "rahul-soni",
    name: "Rahul Soni",
    linkedin: "https://www.linkedin.com/in/thisisrahulsoni/",
    work: ["LinkedIn optimisation", "Content consulting"],
  },
  {
    slug: "harsh-purwar",
    name: "Harsh Purwar",
    linkedin: "https://www.linkedin.com/in/harshsagarbio/",
    work: ["LinkedIn profile optimisation"],
  },
  {
    slug: "dillesh-kumar",
    name: "Dillesh Kumar",
    linkedin: "https://www.linkedin.com/in/dilleshkumar/",
    work: ["Profile redesign"],
  },
  {
    slug: "john-alex",
    name: "John Alex",
    linkedin: "https://www.linkedin.com/in/john-alex-myaltid/",
    work: ["Profile redesign"],
  },
  { slug: "deepesh-naini", name: "Deepesh Naini", linkedin: "https://www.linkedin.com/in/deepeshnaini/", work: ["Founder-led growth"] },
  { slug: "sanyukt-sekhri", name: "Sanyukt Sekhri", linkedin: "https://www.linkedin.com/in/sanyuktsekhri-talkeasio/", work: ["Founder-led growth"] },
  { slug: "ritin-agarwal", name: "Ritin Agarwal", linkedin: "https://www.linkedin.com/in/ritin-agarwal/", work: ["Founder-led growth"] },
  { slug: "heena-arora", name: "Heena Arora", linkedin: "https://www.linkedin.com/in/heena-arora-fundvice/", work: ["Founder-led growth"] },
  { slug: "sumit-agarwal", name: "Sumit Agarwal", linkedin: "https://www.linkedin.com/in/sumit-agarwal-fractional-cfo/", work: ["Founder-led growth"] },
];
