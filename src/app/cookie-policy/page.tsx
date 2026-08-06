import { getSiteSettings } from "@/lib/queries/content";
import { LegalPageClient, type LegalSection } from "@/components/LegalPageClient";

export const revalidate = 0;

export const metadata = {
  title: "Cookie Policy | Successbrew",
  description: "How Successbrew uses cookies on successbrew.in.",
};

const LAST_UPDATED = "6 August 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "1. What cookies we use",
    body: [
      "Successbrew keeps cookie use to a minimum. Today, successbrew.in only sets strictly-necessary cookies from our authentication provider, Neon Auth — these are used to keep you signed in (for example, as a returning speaker or as an admin/team member) and to protect account and admin routes from unauthorized access.",
      "We do not currently use advertising, tracking, or third-party analytics cookies. If that changes in the future — for example, if we add analytics to understand how the site is used — we'll update this policy and, where required by law, ask for your consent first.",
    ],
  },
  {
    heading: "2. Why we use them",
    body: [
      "Strictly-necessary cookies are required for the Services to function — without them, features like signing in, staying signed in, and accessing role-gated admin tools wouldn't work. Because they're essential to the Services, these cookies aren't optional and don't require separate consent under most cookie-law frameworks.",
    ],
  },
  {
    heading: "3. Managing cookies",
    body: [
      "You can control or delete cookies through your browser settings — most browsers let you block or remove cookies for a specific site or all sites. Since successbrew.in only sets essential authentication cookies, blocking them will simply prevent you from staying signed in.",
    ],
  },
  {
    heading: "4. Changes to this policy",
    body: [
      "We'll update this page whenever the cookies we use change — for example if we introduce analytics or marketing tools in the future. We'll update the \"Last updated\" date above whenever we do.",
    ],
  },
  {
    heading: "5. Contact us",
    body: [
      "Questions about this Cookie Policy can be sent to team@successbrew.in. See also our Privacy Policy and Terms of Service.",
    ],
  },
];

export default async function CookiePolicyPage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null,
  }));

  return (
    <LegalPageClient
      title="Cookie Policy"
      lastUpdated={LAST_UPDATED}
      intro="This policy explains the cookies successbrew.in uses and why."
      sections={SECTIONS}
      siteSettings={siteSettings}
    />
  );
}
