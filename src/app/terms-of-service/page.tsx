import { getSiteSettings } from "@/lib/queries/content";
import { LegalPageClient, type LegalSection } from "@/components/LegalPageClient";

export const revalidate = 0;

export const metadata = {
  title: "Terms of Service | Successbrew",
  description: "The terms that govern your use of Successbrew's website, community and events.",
};

const LAST_UPDATED = "6 August 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Acceptance of terms",
    body: [
      "These Terms of Service (\"Terms\") govern your access to and use of successbrew.in and the community, content studio, podcast, learning hub, events and admin tools operated by Successbrew (together, the \"Services\"). By accessing or using the Services — including submitting an application, registering for an event, or creating an account — you agree to these Terms. If you don't agree, please don't use the Services.",
    ],
  },
  {
    heading: "2. Who can use the Services",
    body: [
      "The Services are intended for founders, operators, creators, students and professionals engaged with or curious about the startup ecosystem. You must be able to form a legally binding contract to use the Services — if you're using them on behalf of a company, you're confirming you have the authority to bind that company to these Terms.",
    ],
  },
  {
    heading: "3. Applications, community membership and events",
    body: [
      "Submitting an application through /apply does not guarantee acceptance into the Successbrew community, speaker directory, or any specific program — all applications are reviewed at our discretion, and we may accept, reject, or request more information at any stage.",
      "Event registration (including any \"seats,\" pricing or eligibility notes shown on an event page) is subject to availability and may be limited, changed, or cancelled by us at any time; where an event links out to a third-party registration or ticketing page, that page's own terms also apply.",
      "We may suspend or remove access to community features, speaker profiles, or event registrations for conduct that violates these Terms, is unsafe, fraudulent, or harmful to other members.",
    ],
  },
  {
    heading: "4. Your account",
    body: [
      "If you create an account (for example as a returning speaker or as an admin/team member), you're responsible for keeping your login credentials confidential and for all activity under your account. Tell us immediately at team@successbrew.in if you suspect unauthorized access.",
      "Admin accounts are issued at Successbrew's discretion to team members and are subject to internal access-control policies; we may revoke admin access at any time.",
    ],
  },
  {
    heading: "5. Content you submit",
    body: [
      "When you submit an application, profile information, event registration details, or other content through the Services, you confirm it's accurate and that you have the right to share it with us. You grant Successbrew a non-exclusive, royalty-free license to use, store and display that content as needed to operate the Services — for example, displaying an approved speaker's public profile, or listing an event guest's name and photo on an event's landing page.",
      "You retain ownership of the content you submit. You're responsible for anything you upload, and you agree not to submit content that's unlawful, infringing, defamatory, or that you don't have the rights to share.",
    ],
  },
  {
    heading: "6. Acceptable use",
    body: [
      "You agree not to: attempt to gain unauthorized access to any part of the Services (including the admin panel or other users' accounts); interfere with or disrupt the Services or any servers/networks connected to them (including automated scraping, denial-of-service attempts, or bypassing rate limits); upload malware or attempt to exploit a security vulnerability; misrepresent your identity or affiliation; or use the Services to harass, defraud, or harm others.",
      "We may investigate and take appropriate action — including suspending access and, where warranted, reporting to law enforcement — against anyone who violates this section.",
    ],
  },
  {
    heading: "7. Intellectual property",
    body: [
      "The Successbrew name, logo, site design, and original content (excluding content you or other members submit) are owned by Successbrew or our licensors and are protected by applicable intellectual property laws. You may not copy, modify, or use them without our prior written permission, except as reasonably needed to use the Services as intended (e.g. sharing a link to an event page).",
    ],
  },
  {
    heading: "8. Third-party links and services",
    body: [
      "The Services may link to third-party websites or services (for example, an event's external registration form, or a partner's website). We don't control and aren't responsible for third-party content, policies, or practices — your use of those third-party services is governed by their own terms.",
    ],
  },
  {
    heading: "9. Disclaimers",
    body: [
      "The Services are provided \"as is\" and \"as available,\" without warranties of any kind, express or implied, to the fullest extent permitted by law. We don't guarantee that the Services will be uninterrupted, error-free, or completely secure — see our Privacy Policy for how we work to protect your data.",
    ],
  },
  {
    heading: "10. Limitation of liability",
    body: [
      "To the fullest extent permitted by law, Successbrew and its team will not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of data, revenue or goodwill, arising from your use of the Services.",
    ],
  },
  {
    heading: "11. Changes to the Services or these Terms",
    body: [
      "We may update these Terms from time to time as the Services evolve; we'll update the \"Last updated\" date above when we do. Continued use of the Services after changes take effect means you accept the updated Terms. We may also modify, suspend, or discontinue any part of the Services at any time.",
    ],
  },
  {
    heading: "12. Governing law",
    body: [
      "These Terms are governed by the laws of India, without regard to conflict-of-law principles. Any disputes arising from these Terms or the Services will be subject to the exclusive jurisdiction of the courts located in India.",
    ],
  },
  {
    heading: "13. Contact us",
    body: [
      "Questions about these Terms can be sent to team@successbrew.in.",
    ],
  },
];

export default async function TermsOfServicePage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null,
  }));

  return (
    <LegalPageClient
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      intro="Please read these terms carefully before applying, registering for an event, or otherwise using successbrew.in."
      sections={SECTIONS}
      siteSettings={siteSettings}
    />
  );
}
