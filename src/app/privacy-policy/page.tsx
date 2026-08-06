import { getSiteSettings } from "@/lib/queries/content";
import { LegalPageClient, type LegalSection } from "@/components/LegalPageClient";

export const revalidate = 0;

export const metadata = {
  title: "Privacy Policy | Successbrew",
  description: "How Successbrew collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "6 August 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Who we are",
    body: [
      "Successbrew (\"Successbrew\", \"we\", \"us\", \"our\") operates successbrew.in and the associated community, content studio, podcast, learning hub and events (together, the \"Services\"). This policy explains what personal data we collect through the Services, why we collect it, and the choices you have.",
      "If you have questions about this policy or want to exercise any of the rights described below, contact us at team@successbrew.in.",
    ],
  },
  {
    heading: "2. Information we collect",
    body: [
      "Speaker/creator/founder applications: when you apply through /apply, we collect the information you submit — name, email, phone number, country/city, date of birth, gender, company and role details, industry, funding/team/community size, social and portfolio links, and any files you upload (resume, media kit, pitch deck, logo, headshot).",
      "Account data: if you sign in (for example as a returning speaker or as an admin/team member), we collect the details associated with that account — name, email, and authentication metadata — via our authentication provider, Neon Auth.",
      "Communications: if you email us or contact us through the site, we keep a record of that correspondence so we can respond and keep track of the conversation.",
      "Technical data: like most websites, our hosting and security infrastructure automatically logs standard technical information (such as IP address and request metadata) for security, abuse-prevention and rate-limiting purposes. See our Cookie Policy for details on cookies specifically.",
    ],
  },
  {
    heading: "3. How we use your information",
    body: [
      "To review and process applications to our community, speaker directory, events and programs, and to communicate with you about the status of your application.",
      "To operate the Services — for example, running community events, publishing approved speaker profiles, sending event or podcast updates you've asked for, and administering admin accounts.",
      "To keep the Services secure — including rate-limiting abusive traffic, detecting fraud or spam submissions, and enforcing our Terms of Service.",
      "To comply with legal obligations and to establish, exercise or defend legal claims.",
      "We do not sell your personal data, and we do not use your application data for advertising.",
    ],
  },
  {
    heading: "4. Who we share it with",
    body: [
      "We share personal data only with the service providers that help us run Successbrew, under contract, and only to the extent needed to provide their service: our cloud database provider (Neon, for Postgres data storage), our file storage provider (Amazon Web Services S3, for uploaded documents and images), our transactional email provider (Resend, for confirmation and status-update emails), and our authentication provider (Neon Auth, for account sign-in).",
      "If you are approved as a speaker, the profile information you agree to make public (for example on our speaker/community pages) will be visible to site visitors — we'll always be clear about what's public versus internal when we ask for it.",
      "We may disclose information if required by law, or to protect the rights, property or safety of Successbrew, our community, or others.",
    ],
  },
  {
    heading: "5. Data retention",
    body: [
      "We retain application and account data for as long as your account or application is active, and for a reasonable period afterward to resolve disputes, keep records required by law, and improve our review process. If your application is not approved, we retain it for a limited period so you don't have to resubmit if you reapply, after which it is deleted or anonymized.",
      "You can ask us to delete your data earlier — see \"Your rights\" below.",
    ],
  },
  {
    heading: "6. Your rights",
    body: [
      "Depending on where you're located, you may have rights to access, correct, export, or delete the personal data we hold about you, and to object to or restrict certain processing. To exercise any of these rights, email team@successbrew.in with your request — we'll respond within a reasonable time.",
      "Note that some data (for example, records tied to an approved speaker profile or required for legal/audit purposes) may need to be retained even after a deletion request, as permitted by law.",
    ],
  },
  {
    heading: "7. Security",
    body: [
      "We use industry-standard technical and organizational measures to protect your data — including encryption in transit (HTTPS/TLS), access controls that restrict admin functionality to authorized team members with role-based permissions, and rate-limiting on public submission endpoints. No system is 100% secure, and we can't guarantee absolute security, but we work to keep your data protected and to respond quickly if something goes wrong.",
    ],
  },
  {
    heading: "8. Children's privacy",
    body: [
      "Our Services are intended for founders, creators, professionals and students engaging with the startup ecosystem, and are not directed at children under 16. We do not knowingly collect personal data from children under 16; if you believe a child has provided us with personal data, contact us and we will delete it.",
    ],
  },
  {
    heading: "9. Changes to this policy",
    body: [
      "We may update this policy from time to time as our Services evolve. We'll update the \"Last updated\" date above when we do, and where changes are material, we'll take reasonable steps to let you know.",
    ],
  },
  {
    heading: "10. Contact us",
    body: [
      "Questions, requests or complaints about this policy or how we handle your data can be sent to team@successbrew.in.",
    ],
  },
];

export default async function PrivacyPolicyPage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null,
  }));

  return (
    <LegalPageClient
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro="This policy covers the personal data Successbrew collects when you apply to our community, use our platform, or otherwise interact with successbrew.in."
      sections={SECTIONS}
      siteSettings={siteSettings}
    />
  );
}
