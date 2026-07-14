"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldConfig } from "@/lib/admin/field-types";
import type { ActionResult } from "@/lib/admin/crud";
import { ImageUploadField } from "@/components/admin/generic/ImageUploadField";
import { FileUploadField } from "@/components/admin/generic/FileUploadField";

/**
 * Client-side validation is intentionally skipped here: this component's
 * `fields`/`defaultValues` cross the Server -> Client Component boundary, and
 * a Zod schema (a class instance) can't be serialized across that boundary.
 * Validation is enforced server-side in the corresponding server action
 * (via the same Zod schema, re-parsed there) — this is the authoritative
 * check anyway, per the "never trust client-side validation alone" pattern
 * used throughout the admin panel.
 */
export function ContentForm<T extends FieldValues>({
  fields,
  defaultValues,
  action,
  redirectTo,
}: {
  fields: FieldConfig[];
  defaultValues: Partial<T>;
  action: (formData: FormData) => Promise<ActionResult>;
  redirectTo: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<T>({
    defaultValues: defaultValues as never,
  });

  function onSubmit(values: FieldValues) {
    setServerError(null);
    const formData = new FormData();
    for (const field of fields) {
      const value = values[field.name];
      if (field.type === "boolean") {
        formData.set(field.name, value ? "true" : "false");
      } else if (field.type === "tags") {
        formData.set(field.name, Array.isArray(value) ? value.join(",") : String(value ?? ""));
      } else {
        formData.set(field.name, value == null ? "" : String(value));
      }
    }

    startTransition(async () => {
      const result = await action(formData);
      if ("error" in result) {
        setServerError(result.error);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      {fields.map((field) => {
        const error = form.formState.errors[field.name]?.message as string | undefined;

        return (
          <div key={field.name} className="space-y-2">
            {field.type !== "boolean" && <Label htmlFor={field.name}>{field.label}</Label>}

            {(field.type === "text" || field.type === "url") && (
              <Input
                id={field.name}
                placeholder={"placeholder" in field ? field.placeholder : undefined}
                {...form.register(field.name as never, { required: field.required })}
              />
            )}

            {field.type === "image" && (
              <Controller
                control={form.control}
                name={field.name as never}
                rules={{ required: field.required }}
                render={({ field: rhfField }) => (
                  <ImageUploadField
                    id={field.name}
                    value={(rhfField.value as string) ?? ""}
                    onChange={rhfField.onChange}
                  />
                )}
              />
            )}

            {field.type === "file" && (
              <Controller
                control={form.control}
                name={field.name as never}
                rules={{ required: field.required }}
                render={({ field: rhfField }) => (
                  <FileUploadField
                    id={field.name}
                    value={(rhfField.value as string) ?? ""}
                    onChange={rhfField.onChange}
                  />
                )}
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                id={field.name}
                rows={4}
                {...form.register(field.name as never, { required: field.required })}
              />
            )}

            {field.type === "number" && (
              <Input
                id={field.name}
                type="number"
                {...form.register(field.name as never, { valueAsNumber: true })}
              />
            )}

            {field.type === "tags" && (
              <Controller
                control={form.control}
                name={field.name as never}
                render={({ field: rhfField }) => {
                  const value = rhfField.value as unknown as string[] | string | undefined;
                  return (
                    <Input
                      id={field.name}
                      placeholder={field.placeholder ?? "comma, separated, tags"}
                      value={Array.isArray(value) ? value.join(", ") : (value ?? "")}
                      onChange={(e) =>
                        rhfField.onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                      }
                    />
                  );
                }}
              />
            )}

            {field.type === "boolean" && (
              <Controller
                control={form.control}
                name={field.name as never}
                render={({ field: rhfField }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id={field.name}
                      checked={!!rhfField.value}
                      onCheckedChange={rhfField.onChange}
                    />
                    <Label htmlFor={field.name}>{field.label}</Label>
                  </div>
                )}
              />
            )}

            {field.type === "select" && (
              <Controller
                control={form.control}
                name={field.name as never}
                render={({ field: rhfField }) => (
                  <Select value={rhfField.value} onValueChange={rhfField.onChange}>
                    <SelectTrigger id={field.name}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      })}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
