"use client";

import { FieldLabel } from "@/components/apply/FieldLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CategoryOption {
  id: string;
  label: string;
  subCategories: { id: string; label: string }[];
}

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
    <div className="space-y-6">
      <div className="space-y-2">
        <FieldLabel required>Major Category</FieldLabel>
        <Select
          value={categoryId}
          onValueChange={(next) => onChange({ categoryId: next, subCategoryId: undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <FieldLabel required>Sub Category</FieldLabel>
        <Select
          value={subCategoryId}
          onValueChange={(next) => onChange({ subCategoryId: next })}
          disabled={!selectedCategory}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedCategory ? "Select a sub-category" : "Choose a category first"} />
          </SelectTrigger>
          <SelectContent>
            {selectedCategory?.subCategories.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
