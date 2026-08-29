"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";

const E = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E } } };
const stagger = (d = 0.1) => ({ hidden: {}, visible: { transition: { staggerChildren: d } } });

const FEATURES = [
  "Full access to the Successbrew course",
  "Lifetime community membership",
  "Weekly digest, events & meetups",
  "Direct access to founders, VCs & operators",
  "Templates, playbooks & resource library",
];

function formatInr(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function OfferPageClient({
  siteSettings,
  offer,
}: {
  siteSettings: SiteSettings;
  offer: { title: string; amount: number; mrpAmount: number; currency: string };
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (!data.keyId) {
        toast.error("Checkout isn't live yet — please check back soon.");
        setLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Couldn't load the payment widget. Please try again.");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "Successbrew",
        description: offer.title,
        prefill: { name, email },
        handler: () => {
          router.push(`/offer/success?orderId=${data.orderId}`);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      razorpay.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <NavBar ctaText="Join Community" ctaHref="/apply?source=community" />
      <main className="min-h-screen bg-cream font-sans text-ink">
        <section className="relative overflow-hidden bg-ink pb-20 pt-32 lg:pb-28 lg:pt-40">
          <AmbientBackground tone="dark" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}>
              <motion.div variants={fadeUp}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Limited-time offer
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-[clamp(2.4rem,5.5vw,4.5rem)] font-black leading-[0.98] tracking-tight text-white">
                Join the {offer.title.replace("Successbrew Community + ", "")}
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg text-white/50">
                Everything you need to grow — community, course and network — in one membership.
              </motion.p>

              <motion.ul variants={stagger(0.06)} className="mt-10 space-y-3">
                {FEATURES.map((f) => (
                  <motion.li key={f} variants={fadeUp} className="flex items-center gap-3 text-sm text-white/70">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-black text-ink">✓</span>
                    {f}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: E }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-white">{formatInr(offer.amount)}</span>
                <span className="mb-1 text-lg text-white/40 line-through">{formatInr(offer.mrpAmount)}</span>
              </div>
              <p className="mt-1 text-xs uppercase tracking-widest text-accent">One-time payment</p>

              <form onSubmit={handleCheckout} className="mt-8 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Full name</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="border-white/15 bg-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Email</label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="border-white/15 bg-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full bg-accent text-ink hover:bg-accent/90"
                >
                  {loading ? "Starting checkout…" : `Pay ${formatInr(offer.amount)}`}
                </Button>
                <p className="text-center text-[11px] text-white/30">Secure payment via Razorpay.</p>
              </form>
            </motion.div>
          </div>
        </section>

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
