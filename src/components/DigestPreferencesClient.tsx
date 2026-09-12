"use client";

import { useEffect, useState, useTransition } from "react";
import NavBar from "@/components/NavBar";
import type { SiteSettings } from "@/components/SocialLinks";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMemberTopicSelections, saveTopicSelections } from "@/app/community/digest/preferences/actions";

type Status = "idle" | "loading" | "not-eligible" | "ready" | "saved";

export function DigestPreferencesClient({
  siteSettings,
  topics,
  initialEmail,
}: {
  siteSettings: SiteSettings;
  topics: { id: string; title: string }[];
  initialEmail: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  // Initialized directly (not via an effect-driven setState) so the mount
  // effect below never needs to synchronously update state itself.
  const [status, setStatus] = useState<Status>(initialEmail ? "loading" : "idle");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function fetchSelections(targetEmail: string) {
    startTransition(async () => {
      const res = await getMemberTopicSelections(targetEmail);
      if (!res.eligible) {
        setStatus("not-eligible");
        return;
      }
      setSelected(new Set(res.selectedTopicIds));
      setStatus("ready");
    });
  }

  function load(targetEmail: string) {
    if (!targetEmail.trim()) return;
    setStatus("loading");
    fetchSelections(targetEmail);
  }

  useEffect(() => {
    if (initialEmail) fetchSelections(initialEmail);
    // Only run once on mount for a pre-filled email — not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleTopic(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const res = await saveTopicSelections(email, [...selected]);
      if ("success" in res) setStatus("saved");
    });
  }

  return (
    <>
      <NavBar ctaText="Join Community" ctaHref="/apply?source=community" />
      <main className="min-h-screen bg-cream font-sans text-ink">
        <section className="relative overflow-hidden bg-ink pb-20 pt-32 lg:pb-28 lg:pt-40">
          <AmbientBackground tone="dark" />
          <div className="relative mx-auto max-w-2xl px-6 lg:px-10">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Daily Brief
            </div>
            <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-black leading-[0.98] tracking-tight text-white">
              Choose your topics.
            </h1>
            <p className="mt-4 max-w-lg text-white/50">
              For paid Growth/Founder members. Pick what you want covered in your daily brief — we&rsquo;ll email you a
              PDF each day with what happened today on each.
            </p>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <label className="mb-1.5 block text-xs font-medium text-white/50">Email used on your membership</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="border-white/15 bg-white/10 text-white placeholder:text-white/30"
                />
                <Button onClick={() => load(email)} disabled={isPending || !email.trim()} className="w-full sm:w-auto">
                  {isPending && status === "loading" ? "Checking…" : "Load"}
                </Button>
              </div>

              {status === "not-eligible" && (
                <p className="mt-4 text-sm text-white/60">
                  We couldn&rsquo;t find an active paid membership for this email.{" "}
                  <a href="/community" className="text-accent underline">Explore membership tiers →</a>
                </p>
              )}

              {(status === "ready" || status === "saved") && (
                <div className="mt-6 space-y-4">
                  <ul className="space-y-2">
                    {topics.map((t) => (
                      <li key={t.id}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10">
                          <input
                            type="checkbox"
                            checked={selected.has(t.id)}
                            onChange={() => toggleTopic(t.id)}
                            className="h-4 w-4 accent-accent"
                          />
                          {t.title}
                        </label>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={handleSave} disabled={isPending} size="lg" className="w-full bg-accent text-ink hover:bg-accent/90">
                    {isPending ? "Saving…" : "Save my topics"}
                  </Button>
                  {status === "saved" && <p className="text-center text-sm text-accent">Saved — see you in tomorrow&rsquo;s brief.</p>}
                </div>
              )}
            </div>
          </div>
        </section>
        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
