import { permanentRedirect } from "next/navigation";

// Founder Led Growth and personal branding are one service, with one page.
export default function FounderLedGrowthPage() {
  permanentRedirect("/personal-branding");
}
