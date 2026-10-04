"use client";

/** Single-select pill buttons — used instead of a dropdown when there are only
 * a handful of options, so every choice is visible at a glance. */
export function ChoiceChips({
  id,
  options,
  value,
  onChange,
  disabled = false,
}: {
  id?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div id={id} role="radiogroup" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`rounded-[6px] border px-3.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003CD1]/30 disabled:cursor-not-allowed disabled:opacity-50
              ${selected
                ? "border-[#003CD1] bg-[#003CD1] text-white"
                : "border-[#111111]/15 bg-white text-[#111111]/80 hover:border-[#111111]/35"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
