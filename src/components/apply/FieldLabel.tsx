"use client";

import { Label } from "@/components/ui/label";

/** Wraps the shared Label primitive with a Mandatory/Optional badge, so every
 * field in the /apply wizard states its requirement inline rather than relying
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
      <span
        className={
          required
            ? "text-[10px] font-semibold uppercase tracking-wide text-destructive"
            : "text-[10px] font-semibold uppercase tracking-wide text-[#111111]/40"
        }
      >
        {required ? "Mandatory" : "Optional"}
      </span>
    </Label>
  );
}
