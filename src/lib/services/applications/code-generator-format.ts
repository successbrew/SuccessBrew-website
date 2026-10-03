// Kept free of server imports so client components (the admin counter form)
// can preview codes with the exact same formatting.
const MIN_DIGITS = 3;

export function formatApplicationCode(year: number, sequenceNumber: number): string {
  return `SB-${year}-${String(sequenceNumber).padStart(MIN_DIGITS, "0")}`;
}
