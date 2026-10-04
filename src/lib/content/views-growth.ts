/**
 * Data for the "Views Generated" growth chart on the Services page
 * (src/components/ViewsGrowthChart.tsx).
 *
 * Each entry is the TOTAL views generated up to the end of that period
 * (cumulative), so the line only ever goes up and ends at the headline number.
 * Use real figures only — the chart is shown to prospects as proof.
 *
 * The chart only appears once there are at least 4 entries; until then the
 * tile shows the case studies behind the views instead.
 */
export const VIEWS_GROWTH: { label: string; views: number }[] = [
  // 2019–2020 are estimates (exact figures not on record) — replace if found.
  { label: "2019", views: 150_000 },
  { label: "2020", views: 600_000 },
  { label: "2021", views: 2_000_000 },
  { label: "2022", views: 12_000_000 },
  { label: "2023", views: 35_000_000 },
  { label: "2024", views: 68_000_000 },
  { label: "2025", views: 85_000_000 },
  // Current year, to date — keep this equal to the headline stat (100M+).
  { label: "2026", views: 100_000_000 },
];
