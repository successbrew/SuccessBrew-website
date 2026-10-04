"use client";

import { FieldLabel } from "@/components/apply/FieldLabel";
import { ChoiceChips } from "@/components/apply/ChoiceChips";

export interface CategoryOption {
  id: string;
  label: string;
  subCategories: { id: string; label: string }[];
}

/** Major category as large selectable cards (there are only a few), then the
 * matching sub-categories as chips — every option visible without dropdowns. */
export function StepCategory({
  categories,
  categoryId,
  subCategoryId,
  onChange,
}: {
  categories: CategoryOption[];
  categoryId?: string;
  subCategoryId?: string;
  onChange: (patch: { categoryId?: string; subCategoryId?: string }) => void;
}) {
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-8">
      <div>
        <FieldLabel required>Major Category</FieldLabel>
        <div role="radiogroup" className="mt-3 grid gap-3 sm:grid-cols-2">
          {categories.map((c) => {
            const selected = c.id === categoryId;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ categoryId: c.id, subCategoryId: undefined })}
                className={`flex items-center justify-between gap-3 rounded-[6px] border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003CD1]/30
                  ${selected
                    ? "border-[#003CD1] bg-[#003CD1]/[0.04] ring-1 ring-[#003CD1]"
                    : "border-[#111111]/15 bg-white hover:border-[#111111]/35"}`}
              >
                <span>
                  <span className="block text-[15px] font-semibold text-[#111111]">{c.label}</span>
                  <span className="mt-0.5 block text-xs text-[#111111]/45">
                    {c.subCategories.length} {c.subCategories.length === 1 ? "area" : "areas"}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? "border-[#003CD1] bg-[#003CD1]" : "border-[#111111]/25"}`}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={selectedCategory ? "" : "opacity-50"}>
        <FieldLabel required>Sub Category</FieldLabel>
        <div className="mt-3">
          {selectedCategory ? (
            <ChoiceChips
              options={selectedCategory.subCategories.map((s) => ({ value: s.id, label: s.label }))}
              value={subCategoryId}
              onChange={(next) => onChange({ subCategoryId: next })}
            />
          ) : (
            <p className="text-sm text-[#111111]/50">Choose a major category first.</p>
          )}
        </div>
      </div>
    </div>
  );
}
