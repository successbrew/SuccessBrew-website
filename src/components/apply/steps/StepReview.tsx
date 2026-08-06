"use client";

import { Button } from "@/components/ui/button";
import type { ApplicationDraft } from "../useApplicationDraft";
import type { CategoryOption } from "./StepCategory";

function SummaryRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#111111]/8 py-3 last:border-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#111111]/40">{label}</p>
        <p className="mt-0.5 text-sm text-[#111111]">{value || "—"}</p>
      </div>
      <button type="button" onClick={onEdit} className="shrink-0 text-xs font-semibold text-[#0037D2] hover:underline">
        Edit
      </button>
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

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#111111]/10 p-5">
        <SummaryRow
          label="Name"
          value={`${draft.personal.firstName ?? ""} ${draft.personal.lastName ?? ""}`.trim()}
          onEdit={() => onEditStep(0)}
        />
        <SummaryRow label="Email" value={draft.personal.email ?? ""} onEdit={() => onEditStep(0)} />
        <SummaryRow
          label="Category"
          value={category && subCategory ? `${category.label} / ${subCategory.label}` : ""}
          onEdit={() => onEditStep(1)}
        />
        <SummaryRow label="Company" value={draft.professional.companyName ?? ""} onEdit={() => onEditStep(2)} />
        <SummaryRow label="LinkedIn" value={draft.professional.socials?.linkedin ?? ""} onEdit={() => onEditStep(3)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-3">
        {userEmail && <p className="text-sm text-[#111111]/60">Submitting as <strong>{userEmail}</strong></p>}
        <Button type="button" onClick={onSubmit} disabled={submitting} className="w-full">
          {submitting ? "Submitting…" : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
