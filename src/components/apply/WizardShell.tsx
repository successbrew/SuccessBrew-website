"use client";

import { Button } from "@/components/ui/button";

const STEP_LABELS = ["Personal", "Category", "Professional", "Presence", "Review"];

export function WizardShell({
  stepIndex,
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  hideFooter = false,
  children,
}: {
  stepIndex: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  hideFooter?: boolean;
  children: React.ReactNode;
}) {
  const total = STEP_LABELS.length;

  return (
    <section className="mx-auto max-w-2xl px-6 pb-24 pt-32 lg:pt-40">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]/50">
          <span>Step {stepIndex + 1} of {total}</span>
          <span>{STEP_LABELS[stepIndex]}</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#111111]/8">
          <div
            className="h-full rounded-full bg-[#0037D2] transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="text-balance text-3xl font-black tracking-tight text-[#111111] md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-[#111111]/60">{subtitle}</p>}

      <div className="mt-8">{children}</div>

      {!hideFooter && (
        <div className="mt-10 flex items-center justify-between gap-3">
          {onBack ? (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          ) : <span />}
          {onNext && (
            <Button type="button" onClick={onNext} disabled={nextDisabled}>
              {nextLabel}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
