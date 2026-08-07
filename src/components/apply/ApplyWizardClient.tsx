"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import type { SiteSettings } from "@/components/SocialLinks";
import { WizardShell } from "./WizardShell";
import { useApplicationDraft } from "./useApplicationDraft";
import { useFileUpload } from "./useFileUpload";
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
}: {
  categories: CategoryOption[];
  userEmail: string | null;
  siteSettings: SiteSettings;
}) {
  const { draft, update, clear, hydrated, discardedInvalidDraft } = useApplicationDraft();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [pendingHeadshot, setPendingHeadshot] = useState<File | null>(null);
  const { upload: uploadHeadshot, isUploading: uploadingHeadshot, error: headshotError } = useFileUpload();

  const stepIndex = draft.currentStep;

  function goTo(index: number) {
    update({ currentStep: Math.max(0, Math.min(index, TOTAL_STEPS - 1)) });
  }

  async function handlePersonalNext() {
    if (pendingHeadshot) {
      const url = await uploadHeadshot(pendingHeadshot);
      if (!url) return; // stay on this step — error is shown via headshotError
      update({ personal: { ...draft.personal, headshotUrl: url } });
      setPendingHeadshot(null);
    }
    goTo(1);
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
    });

    setSubmitting(false);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }
    setSubmittedCode(result.applicationCode);
    clear();
  }

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
          <section className="mx-auto max-w-xl px-6 pb-24 pt-40 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0037D2]">Application Submitted</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">You&rsquo;re in the queue.</h1>
            <p className="mt-4 text-[#111111]/60">
              Your application code is <strong>{submittedCode}</strong>. Our team will review it and follow up by email.
            </p>
            <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#111111] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#0037D2]">
              Back to Home
            </Link>
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
            subtitle="Basic personal details."
            onNext={handlePersonalNext}
            nextDisabled={!isStepComplete(0, draft) || uploadingHeadshot}
            nextLabel={uploadingHeadshot ? "Uploading…" : "Continue"}
          >
            {discardedInvalidDraft && (
              <p className="mb-4 text-xs text-[#111111]/50">
                We couldn&rsquo;t restore your previous progress, so we started a fresh application.
              </p>
            )}
            <StepPersonal
              value={draft.personal}
              onChange={(patch) => update({ personal: { ...draft.personal, ...patch } })}
              pendingHeadshot={pendingHeadshot}
              onSelectHeadshot={setPendingHeadshot}
              uploadError={headshotError}
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Clear your saved progress and start over?")) clear();
              }}
              className="mt-4 text-xs text-[#111111]/40 underline underline-offset-2 hover:text-[#111111]/70"
            >
              Start over
            </button>
          </WizardShell>
        )}

        {stepIndex === 1 && (
          <WizardShell
            stepIndex={1}
            title="What kind of speaker are you?"
            subtitle="This decides which topics and rooms you're matched with."
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
            title="Professional details"
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
            title="Online presence"
            subtitle="LinkedIn is required; the rest are optional."
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
          <WizardShell stepIndex={4} title="Review & submit" onBack={() => goTo(3)} hideFooter>
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
