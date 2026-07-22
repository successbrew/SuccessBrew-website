import type { ReactNode } from "react";

export type FieldConfig =
  | { name: string; label: string; type: "text" | "textarea" | "url"; required?: boolean; placeholder?: string }
  | { name: string; label: string; type: "number"; required?: boolean }
  | { name: string; label: string; type: "date"; required?: boolean }
  | { name: string; label: string; type: "boolean" }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { name: string; label: string; type: "tags"; placeholder?: string }
  /** Renders as an S3 upload widget (see ImageUploadField) — value is the resulting public URL. */
  | { name: string; label: string; type: "image"; required?: boolean }
  /** Renders as an S3 upload widget for non-image files, e.g. PDFs (see FileUploadField) — value is the resulting public URL. */
  | { name: string; label: string; type: "file"; required?: boolean };

export type ColumnConfig<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
};
