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

/** key must name a plain string/number/boolean field on T — DataTable is a Client
 * Component, so a render function can't cross the server/client boundary from its
 * Server Component callers. Flatten any relation you need to show onto the row
 * (a plain field) before passing rows to DataTable, rather than adding one back. */
export type ColumnConfig<T> = {
  key: Extract<keyof T, string>;
  label: string;
};
