/**
 * Event dates are always shown in India time. Formatting with the runtime's
 * own zone would render one day on the server (UTC in production) and another
 * in an Indian visitor's browser — a wrong date plus a hydration mismatch.
 */
const IST = "Asia/Kolkata";

export function eventDateParts(iso: string) {
  const d = new Date(iso);
  const part = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-IN", { ...o, timeZone: IST });
  return {
    day: part({ day: "2-digit" }),
    month: part({ month: "short" }).toUpperCase(),
    year: Number(part({ year: "numeric" })),
  };
}

/** Calendar date in India as YYYYMMDD (for all-day calendar links). */
export function istDateStamp(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: IST }).replace(/-/g, "");
}
