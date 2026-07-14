/** Flattens a FormData into a plain object, splitting comma-separated "tags" style fields elsewhere via Zod preprocessing. */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    obj[key] = value;
  }
  return obj;
}
