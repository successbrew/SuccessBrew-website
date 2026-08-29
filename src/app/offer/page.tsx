import { getSiteSettings } from "@/lib/queries/content";
import { OFFER_PRODUCT } from "@/lib/commerce/product";
import { OfferPageClient } from "@/components/OfferPageClient";

export const revalidate = 0;

export const metadata = {
  title: "Join the Community | Successbrew",
  description: "Get instant access to the Successbrew community and course for ₹2,999.",
};

export default async function OfferPage() {
  const siteSettings = await getSiteSettings().catch(() => ({
    instagramUrl: null,
    instagramUrl2: null,
    linkedinUrl: null,
    youtubeUrl: null,
  }));

  return (
    <OfferPageClient
      siteSettings={siteSettings}
      offer={{
        title: OFFER_PRODUCT.title,
        amount: OFFER_PRODUCT.amount,
        mrpAmount: OFFER_PRODUCT.mrpAmount,
        currency: OFFER_PRODUCT.currency,
      }}
    />
  );
}
