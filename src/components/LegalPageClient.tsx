"use client";

import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import type { SiteSettings } from "@/components/SocialLinks";

export interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPageClient({
  title,
  lastUpdated,
  intro,
  sections,
  siteSettings,
}: {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
  siteSettings: SiteSettings;
}) {
  return (
    <>
      <NavBar activePage="" ctaText="Join Community" ctaHref="/apply" />
      <main className="min-h-screen overflow-x-hidden bg-[#F2ECDD] font-sans text-[#111111]">
        <section className="bg-[#F2ECDD] pt-32 pb-16 lg:pt-44 lg:pb-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Legal</p>
            <h1 className="mt-3 text-balance text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
            <p className="mt-4 text-sm font-semibold text-[#111111]/50">Last updated: {lastUpdated}</p>
            {intro && <p className="mt-6 text-base leading-relaxed text-[#111111]/70">{intro}</p>}
          </div>
        </section>

        <section className="bg-[#F0EBD8] py-16 lg:py-20">
          <div className="mx-auto max-w-3xl space-y-12 px-6 lg:px-10">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="text-xl font-black tracking-tight md:text-2xl">{s.heading}</h2>
                <div className="mt-4 space-y-4">
                  {s.body.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-[#111111]/70 md:text-base">{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
