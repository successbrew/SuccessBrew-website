export const EVENT_CATEGORIES = [
  { value: "TECH_INTEGRATE", label: "Tech Integrate" },
  { value: "D2C", label: "D2C" },
  { value: "INVESTORS", label: "Investors" },
  { value: "RETREATS", label: "Retreats" },
  { value: "MEGA_EVENTS", label: "Mega Events" },
  { value: "GENERAL", label: "General" },
] as const;

export type EventCategoryValue = (typeof EVENT_CATEGORIES)[number]["value"];

export function eventCategoryLabel(value: string) {
  return EVENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
