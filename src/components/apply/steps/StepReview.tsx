"use client";

import type { ApplicationDraft } from "../useApplicationDraft";
import type { CategoryOption } from "./StepCategory";

function ReviewGroup({
  title,
  onEdit,
  rows,
}: {
  title: string;
  onEdit: () => void;
  rows: [label: string, value: string | undefined][];
}) {
  return (
    <div className="rounded-[6px] border border-[#111111]/10">
      <div className="flex items-center justify-between border-b border-[#111111]/8 px-5 py-3">
        <p className="text-sm font-semibold text-[#111111]">{title}</p>
        <button type="button" onClick={onEdit} className="-m-2 p-2 text-xs font-semibold text-[#003CD1] hover:underline">
          Edit
        </button>
      </div>
      <dl className="grid gap-x-6 gap-y-4 px-5 py-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-[#111111]/45">{label}</dt>
            <dd className="mt-0.5 break-words text-sm text-[#111111]">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function StepReview({
  draft,
  categories,
  userEmail,
  onEditStep,
  onSubmit,
  submitting,
  error,
}: {
  draft: ApplicationDraft;
  categories: CategoryOption[];
  userEmail: string | null;
  onEditStep: (index: number) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const category = categories.find((c) => c.id === draft.categoryId);
  const subCategory = category?.subCategories.find((s) => s.id === draft.subCategoryId);
  const p = draft.personal;
  const pr = draft.professional;

  return (
    <div className="space-y-4">
      <ReviewGroup
        title="Personal"
        onEdit={() => onEditStep(0)}
        rows={[
          ["Name", `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()],
          ["Email", p.email],
          ["Phone", p.phone],
          ["Location", [p.city, p.country].filter(Boolean).join(", ")],
        ]}
      />
      <ReviewGroup
        title="Category"
        onEdit={() => onEditStep(1)}
        rows={[
          ["Major category", category?.label],
          ["Sub category", subCategory?.label],
        ]}
      />
      <ReviewGroup
        title="Professional"
        onEdit={() => onEditStep(2)}
        rows={[
          ["Company", pr.companyName],
          ["Role", pr.currentRole],
          ["Industry", pr.industry],
          ["Experience", pr.yearsExperience !== undefined ? `${pr.yearsExperience} years` : undefined],
        ]}
      />
      <ReviewGroup
        title="Presence"
        onEdit={() => onEditStep(3)}
        rows={[["LinkedIn", pr.socials?.linkedin]]}
      />

      {error && (
        <p className="rounded-[6px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-3 pt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#003CD1] text-[15px] font-semibold text-white transition-colors hover:bg-[#0032b0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
        <p className="text-center text-xs text-[#111111]/45">
          {userEmail ? <>Submitting as <strong className="font-semibold text-[#111111]/70">{userEmail}</strong> · </> : null}
          Our team reviews every application by hand and replies by email.
        </p>
      </div>
    </div>
  );
}
