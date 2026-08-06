/** Horizontal bar list — single sequential hue. Identity is carried by the label,
 * not color, since every bar in the list represents the same metric (count). */
export function BarList({ items }: { items: { label: string; value: number }[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
          <div>
            <p className="mb-1 truncate text-foreground">{item.label}</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[#0037D2]"
                style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }}
              />
            </div>
          </div>
          <span className="font-medium tabular-nums text-foreground">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
