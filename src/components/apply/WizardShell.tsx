"use client";

export const STEPS = [
  { label: "Personal", desc: "About you" },
  { label: "Category", desc: "What you do" },
  { label: "Professional", desc: "Your work" },
  { label: "Presence", desc: "Where to find you" },
  { label: "Review", desc: "Check and submit" },
] as const;

/**
 * Layout for every step of the /apply wizard: a sticky step navigator on the
 * left (collapses to a compact progress bar on mobile) and the current step in
 * a white card on the right, with its actions pinned to the card's footer.
 */
export function WizardShell({
  stepIndex,
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  hideFooter = false,
  intro,
  reachable,
  completed,
  onJump,
  onStartOver,
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
  /** Welcoming intro at the top of the navigator. */
  intro?: { eyebrow: string; text: string };
  /** Per step: can the applicant jump straight to it (all earlier steps done)? */
  reachable: boolean[];
  /** Per step: is it filled in? */
  completed: boolean[];
  onJump: (index: number) => void;
  onStartOver?: () => void;
  children: React.ReactNode;
}) {
  const total = STEPS.length;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:pt-36">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-14">
        {/* ── Navigator ── */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          {intro && (
            <div className={stepIndex === 0 ? "" : "hidden lg:block"}>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#003CD1]">{intro.eyebrow}</p>
              <p className="mt-3 text-balance text-[15px] text-[#111111]/70">{intro.text}</p>
            </div>
          )}

          {/* Desktop: full step list */}
          <ol className={`relative hidden lg:block ${intro ? "mt-10" : ""}`}>
            <span aria-hidden="true" className="absolute bottom-5 left-[15px] top-5 w-px bg-gradient-to-b from-[#003CD1]/40 via-[#111111]/10 to-[#C6FF3A]" />
            {STEPS.map((s, i) => {
              const isCurrent = i === stepIndex;
              const isDone = completed[i] && !isCurrent;
              const canJump = reachable[i] && !isCurrent;
              return (
                <li key={s.label} className="relative">
                  <button
                    type="button"
                    disabled={!canJump}
                    onClick={() => onJump(i)}
                    aria-current={isCurrent ? "step" : undefined}
                    className="group flex w-full items-center gap-4 py-2.5 text-left disabled:cursor-default"
                  >
                    <span
                      className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors
                        ${isCurrent
                          ? "border-[#003CD1] bg-white text-[#003CD1] ring-4 ring-[#003CD1]/10"
                          : isDone
                            ? "border-transparent bg-gradient-to-br from-[#003CD1] to-[#1F55E8] text-white"
                            : "border-[#111111]/15 bg-[#F2ECDD] text-[#111111]/40"}`}
                    >
                      {isDone ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span>
                      <span className={`block text-sm font-semibold ${isCurrent ? "text-[#111111]" : canJump ? "text-[#111111]/70 group-hover:text-[#111111]" : "text-[#111111]/40"}`}>
                        {s.label}
                      </span>
                      <span className="block text-xs text-[#111111]/45">{s.desc}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Mobile: compact progress */}
          <div className={`lg:hidden ${intro && stepIndex === 0 ? "mt-8" : ""}`}>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]/50">
              <span>Step {stepIndex + 1} of {total}</span>
              <span>{STEPS[stepIndex].label}</span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {STEPS.map((s, i) => (
                <span key={s.label} className={`h-1.5 rounded-full ${i < stepIndex ? "bg-[#003CD1]" : i === stepIndex ? "bg-gradient-to-r from-[#003CD1] to-[#C6FF3A]" : "bg-[#111111]/10"}`} />
              ))}
            </div>
          </div>

          <div className="mt-8 hidden items-center gap-2 text-xs text-[#111111]/45 lg:flex">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Progress saves automatically on this device.
          </div>
          {onStartOver && (
            <button type="button" onClick={onStartOver}
              className="mt-3 text-xs text-[#111111]/40 underline underline-offset-2 hover:text-[#111111]/70 lg:mt-2">
              Start over
            </button>
          )}
        </aside>

        {/* ── Step card ── */}
        <div className="overflow-hidden rounded-xl border border-[#111111]/10 bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04),0_24px_48px_-24px_rgba(17,17,17,0.18)]">
          <header className="border-b border-[#111111]/8 px-6 py-6 md:px-10 md:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]/40">Step {stepIndex + 1} · {STEPS[stepIndex].label}</p>
            <h1 className="mt-2 text-balance text-2xl font-black tracking-tight text-[#111111] md:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-[#111111]/60">{subtitle}</p>}
          </header>

          {/* Fields: white, near-rectangular, comfortably tall, blue focus. */}
          <div
            className="px-6 py-8 md:px-10
              [&_[data-slot=input]]:h-11 [&_[data-slot=input]]:rounded-[6px] [&_[data-slot=input]]:border-[#111111]/15 [&_[data-slot=input]]:bg-white [&_[data-slot=input]]:text-[15px] [&_[data-slot=input]]:shadow-none
              [&_[data-slot=input]:focus-visible]:border-[#003CD1] [&_[data-slot=input]:focus-visible]:ring-[3px] [&_[data-slot=input]:focus-visible]:ring-[#003CD1]/15
              [&_[data-slot=select-trigger]]:h-11 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-trigger]]:rounded-[6px] [&_[data-slot=select-trigger]]:border-[#111111]/15 [&_[data-slot=select-trigger]]:bg-white [&_[data-slot=select-trigger]]:shadow-none
              [&_[data-slot=textarea]]:rounded-[6px] [&_[data-slot=textarea]]:border-[#111111]/15 [&_[data-slot=textarea]]:bg-white"
          >
            {children}
          </div>

          {!hideFooter && (
            <footer className="flex items-center justify-between gap-3 border-t border-[#111111]/8 bg-[#FAFAF8] px-6 py-4 md:px-10">
              {onBack ? (
                <button type="button" onClick={onBack}
                  className="inline-flex h-11 items-center gap-2 rounded-[6px] px-3 text-sm font-semibold text-[#111111]/60 transition-colors hover:bg-[#111111]/5 hover:text-[#111111]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
                  Back
                </button>
              ) : <span />}
              {onNext && (
                <button type="button" onClick={onNext} disabled={nextDisabled}
                  className="glow-blue inline-flex h-11 items-center gap-2 rounded-[6px] bg-gradient-to-r from-[#003CD1] to-[#1F55E8] px-6 text-sm font-semibold text-white transition-colors hover:from-[#0032b0] hover:to-[#0032b0] disabled:shadow-none disabled:bg-none disabled:cursor-not-allowed disabled:bg-[#111111]/15 disabled:text-[#111111]/40">
                  {nextLabel}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </button>
              )}
            </footer>
          )}
        </div>
      </div>
    </section>
  );
}
