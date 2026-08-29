"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Button } from "@/components/ui/button";

type Status = "checking" | "PENDING" | "INITIATED" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" | "not-found" | "timeout";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 25; // ~50s

export function OfferSuccessClient({
  orderId,
  siteSettings,
}: {
  orderId: string | null;
  siteSettings: SiteSettings;
}) {
  const [status, setStatus] = useState<Status>(orderId ? "checking" : "not-found");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let attempts = 0;
    let cancelled = false;

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(`/api/checkout/status?orderId=${encodeURIComponent(orderId as string)}`);
        if (!res.ok) {
          if (!cancelled) setStatus("not-found");
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        if (data.status === "PAID") {
          setStatus("PAID");
          setRedirectUrl(data.redirectUrl ?? null);
          return;
        }
        if (data.status === "FAILED" || data.status === "CANCELLED" || data.status === "REFUNDED") {
          setStatus(data.status);
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          setStatus("timeout");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          if (!cancelled) setStatus("timeout");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <>
      <NavBar ctaText="Join Community" ctaHref="/apply?source=community" />
      <main className="flex min-h-screen flex-col bg-ink font-sans text-white">
        <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-32">
          <AmbientBackground tone="dark" />
          <div className="relative mx-auto max-w-lg text-center">
            {status === "checking" && (
              <>
                <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
                <h1 className="text-2xl font-bold">Confirming your payment…</h1>
                <p className="mt-3 text-white/50">This usually takes a few seconds. Don&rsquo;t close this page.</p>
              </>
            )}

            {status === "PAID" && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl text-ink">✓</div>
                <h1 className="text-3xl font-black">You&rsquo;re in!</h1>
                <p className="mt-3 text-white/50">Payment confirmed. Your access is ready.</p>
                {redirectUrl ? (
                  <Button asChild size="lg" className="mt-8 bg-accent text-ink hover:bg-accent/90">
                    <a href={redirectUrl}>Go to your course →</a>
                  </Button>
                ) : (
                  <p className="mt-8 text-sm text-white/40">
                    We&rsquo;re finishing setting up your access — check your email shortly, or reach out to support if it doesn&rsquo;t arrive soon.
                  </p>
                )}
              </>
            )}

            {status === "timeout" && (
              <>
                <h1 className="text-2xl font-bold">Still confirming…</h1>
                <p className="mt-3 text-white/50">
                  Your payment may still be processing. Refresh this page in a minute, or contact support if this
                  persists — your order id is <span className="text-white/70">{orderId}</span>.
                </p>
              </>
            )}

            {(status === "FAILED" || status === "CANCELLED") && (
              <>
                <h1 className="text-2xl font-bold">Payment didn&rsquo;t go through</h1>
                <p className="mt-3 text-white/50">No worries — you haven&rsquo;t been charged. You can try again.</p>
                <Button asChild size="lg" className="mt-8 bg-accent text-ink hover:bg-accent/90">
                  <a href="/offer">Try again</a>
                </Button>
              </>
            )}

            {status === "REFUNDED" && (
              <>
                <h1 className="text-2xl font-bold">This order was refunded</h1>
                <p className="mt-3 text-white/50">Access for this order has been revoked. Contact support if this looks wrong.</p>
              </>
            )}

            {status === "not-found" && (
              <>
                <h1 className="text-2xl font-bold">We couldn&rsquo;t find that order</h1>
                <p className="mt-3 text-white/50">
                  If you just completed a payment, check your email for confirmation, or{" "}
                  <a href="/offer" className="text-accent underline">head back to the offer page</a>.
                </p>
              </>
            )}
          </div>
        </section>
        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
