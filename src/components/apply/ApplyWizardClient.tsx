"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import type { SiteSettings } from "@/components/SocialLinks";
import { WizardShell } from "./WizardShell";
import { useApplicationDraft } from "./useApplicationDraft";
import { StepPersonal } from "./steps/StepPersonal";
import { StepCategory, type CategoryOption } from "./steps/StepCategory";
import { StepProfessional } from "./steps/StepProfessional";
import { StepPresence } from "./steps/StepPresence";
import { StepReview } from "./steps/StepReview";
import { submitApplicationAction } from "@/app/apply/actions";

const TOTAL_STEPS = 5;

function isStepComplete(stepIndex: number, draft: ReturnType<typeof useApplicationDraft>["draft"]) {
  switch (stepIndex) {
    case 0: {
      const p = draft.personal;
      return Boolean(p.firstName && p.lastName && p.email && p.phone && p.country && p.city && p.birthday && p.gender);
    }
    case 1:
      return Boolean(draft.categoryId && draft.subCategoryId);
    case 2: {
      const pr = draft.professional;
      return Boolean(pr.companyName && pr.currentRole && pr.industry && pr.yearsExperience !== undefined);
    }
    case 3:
      return Boolean(draft.professional.socials?.linkedin);
    default:
      return true;
  }
}

export function ApplyWizardClient({
  categories,
  userEmail,
  siteSettings,
  source,
}: {
  categories: CategoryOption[];
  userEmail: string | null;
  siteSettings: SiteSettings;
  source: "SPEAKER" | "COMMUNITY";
}) {
  const { draft, update, clear, hydrated, discardedInvalidDraft } = useApplicationDraft();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const stepIndex = draft.currentStep;
  const completed = Array.from({ length: TOTAL_STEPS }, (_, i) => isStepComplete(i, draft));
  // A step can be jumped to once every step before it is filled in.
  const reachable = completed.map((_, i) => completed.slice(0, i).every(Boolean));
  const isCommunity = source === "COMMUNITY";

  function startOver() {
    if (window.confirm("Clear your saved progress and start over?")) clear();
  }

  function goTo(index: number) {
    update({ currentStep: Math.max(0, Math.min(index, TOTAL_STEPS - 1)) });
  }



  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const documents = Object.entries(draft.documents)
      .filter(([, url]) => Boolean(url))
      .map(([kind, url]) => ({ kind, url: url as string }));

    const result = await submitApplicationAction({
      categoryId: draft.categoryId,
      subCategoryId: draft.subCategoryId,
      personal: draft.personal,
      professional: draft.professional,
      documents,
      source,
    });

    setSubmitting(false);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }
    setSubmittedCode(result.applicationCode);
    clear();
  }

  const intro = isCommunity
    ? {
        eyebrow: "Apply to join the community",
        text: "Help us get to know you. The more you share, the better we can connect you with the people, events and opportunities in the community that fit you best.",
      }
    : {
        eyebrow: "Apply as a speaker",
        text: "Tell us about yourself and your work — it helps us match you with the right topics, rooms and audiences.",
      };

  if (!hydrated) {
    return (
      <>
        <NavBar activePage="Apply" ctaText="Home" ctaHref="/" />
        <main className="min-h-screen bg-[#F2ECDD]" />
      </>
    );
  }

  if (submittedCode) {
    return (
      <>
        <NavBar activePage="Apply" ctaText="Home" ctaHref="/" />
        <main className="min-h-screen bg-[#F2ECDD] font-sans text-[#111111]">
          <section className="mx-auto max-w-xl px-6 pb-24 pt-32 lg:pt-40">
            <div className="overflow-hidden rounded-xl border border-[#111111]/10 bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04),0_24px_48px_-24px_rgba(17,17,17,0.18)]">
              <div className="px-6 pb-8 pt-10 text-center md:px-10">
                <span className="glow-blue mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#003CD1] to-[#1F55E8] text-white ring-4 ring-[#C6FF3A]/50">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-[#003CD1]">
                  {isCommunity ? "Community Application Received" : "Application Submitted"}
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                  {isCommunity ? <>Thanks for applying.</> : <>You&rsquo;re in the queue.</>}
                </h1>
                <p className="mt-3 text-[15px] text-[#111111]/60">
                  We&rsquo;ve emailed you a confirmation. Keep your reference code handy.
                </p>
                <div className="mx-auto mt-6 inline-flex flex-col rounded-[6px] bg-[#FFF3D0] px-6 py-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111111]/50">Reference code</span>
                  <span className="text-xl font-black tracking-tight text-[#003CD1]">{submittedCode}</span>
                </div>
              </div>
              <div className="border-t border-[#111111]/8 bg-[#FAFAF8] px-6 py-6 md:px-10">
                <p className="text-sm font-semibold">What happens next</p>
                <ol className="mt-4 space-y-3 text-sm text-[#111111]/70">
                  {(isCommunity
                    ? ["Our team reviews your application by hand.", "We may reach out with a few questions.", "Once approved, we'll email you a welcome — and you're in."]
                    : ["Our team reviews your application by hand.", "We may reach out for a short conversation.", "If it's a fit, we'll onboard you as a Successbrew speaker."]
                  ).map((line, i) => (
                    <li key={line} className="flex gap-3">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#003CD1]/10 text-[11px] font-semibold text-[#003CD1]">{i + 1}</span>
                      {line}
                    </li>
                  ))}
                </ol>
                <Link href="/" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[6px] bg-[#111111] text-sm font-semibold text-white transition-colors hover:bg-[#003CD1]">
                  Back to Home
                </Link>
              </div>
            </div>
          </section>
          <Footer siteSettings={siteSettings} />
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar activePage="Apply" ctaText="Home" ctaHref="/" />
      <main className="min-h-screen bg-[#F2ECDD] font-sans text-[#111111]">
        {stepIndex === 0 && (
          <WizardShell
            stepIndex={0}
            title="Tell us about you"
            subtitle="The basics, so we know who we're talking to."
            reachable={reachable}
            completed={completed}
            onJump={goTo}
            onStartOver={startOver}
            intro={intro}
            onNext={() => goTo(1)}
            nextDisabled={!isStepComplete(0, draft)}
          >
            {discardedInvalidDraft && (
              <p className="mb-6 rounded-[6px] bg-[#FAFAF8] px-4 py-3 text-xs text-[#111111]/60">
                We couldn&rsquo;t restore your previous progress, so we started a fresh application.
              </p>
            )}
            <StepPersonal
              value={draft.personal}
              onChange={(patch) => update({ personal: { ...draft.personal, ...patch } })}
            />
          </WizardShell>
        )}

        {stepIndex === 1 && (
          <WizardShell
            stepIndex={1}
            title={isCommunity ? "Which best describes you?" : "What kind of speaker are you?"}
            subtitle={isCommunity ? "This shapes which people, events and opportunities we connect you with." : "This decides which topics and rooms you're matched with."}
            reachable={reachable}
            completed={completed}
            onJump={goTo}
            onStartOver={startOver}
            intro={intro}
            onBack={() => goTo(0)}
            onNext={() => goTo(2)}
            nextDisabled={!isStepComplete(1, draft)}
          >
            <StepCategory
              categories={categories}
              categoryId={draft.categoryId}
              subCategoryId={draft.subCategoryId}
              onChange={(patch) => update(patch)}
            />
          </WizardShell>
        )}

        {stepIndex === 2 && (
          <WizardShell
            stepIndex={2}
            title="Your work"
            subtitle="Tell us what you're building or working on."
            reachable={reachable}
            completed={completed}
            onJump={goTo}
            onStartOver={startOver}
            intro={intro}
            onBack={() => goTo(1)}
            onNext={() => goTo(3)}
            nextDisabled={!isStepComplete(2, draft)}
          >
            <StepProfessional
              value={draft.professional}
              onChange={(patch) => update({ professional: { ...draft.professional, ...patch } })}
            />
          </WizardShell>
        )}

        {stepIndex === 3 && (
          <WizardShell
            stepIndex={3}
            title="Where can we find you?"
            subtitle="Only LinkedIn is required."
            reachable={reachable}
            completed={completed}
            onJump={goTo}
            onStartOver={startOver}
            intro={intro}
            onBack={() => goTo(2)}
            onNext={() => goTo(4)}
            nextDisabled={!isStepComplete(3, draft)}
          >
            <StepPresence
              value={draft.professional.socials ?? {}}
              onChange={(patch) =>
                update({ professional: { ...draft.professional, socials: { ...draft.professional.socials, ...patch } } })
              }
            />
          </WizardShell>
        )}

        {stepIndex === 4 && (
          <WizardShell
            stepIndex={4}
            title="Review & submit"
            subtitle="Check everything looks right — you can edit any section."
            reachable={reachable}
            completed={completed}
            onJump={goTo}
            onStartOver={startOver}
            intro={intro}
            onBack={() => goTo(3)}
            hideFooter
          >
            <StepReview
              draft={draft}
              categories={categories}
              userEmail={userEmail}
              onEditStep={goTo}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={submitError}
            />
          </WizardShell>
        )}
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
