"use client";

import { Label } from "@/components/ui/label";

/** Wraps the shared Label primitive with a red required star / Optional badge, so
 * every field in the /apply wizard states its requirement inline rather than relying
 * on the native `required` attribute (which isn't visible until validation fires). */
export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required: boolean;
  children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      {required ? (
        <span className="-ml-1.5 text-destructive">
          <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </span>
      ) : (
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#111111]/40">Optional</span>
      )}
    </Label>
  );
}
