import { getSiteSettings } from "@/lib/queries/content";
import { OfferSuccessClient } from "@/components/OfferSuccessClient";

export const revalidate = 0;

export const metadata = {
  title: "Payment confirmation | Successbrew",
};

export default async function OfferSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const [{ orderId }, siteSettings] = await Promise.all([
    searchParams,
    getSiteSettings().catch(() => ({
      instagramUrl: null,
      instagramUrl2: null,
      linkedinUrl: null,
      youtubeUrl: null,
    })),
  ]);

  return <OfferSuccessClient orderId={orderId ?? null} siteSettings={siteSettings} />;
}
