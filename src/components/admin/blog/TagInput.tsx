"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Chip-style tag picker: type to search existing tags, Enter/comma to add (a new
 * tag is created on save if no existing one matches), Backspace removes the last. */
export function TagInput({
  id,
  value,
  onChange,
  suggestions,
  max = 6,
}: {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  max?: number;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  // Only take the highlighted suggestion on Enter once the user has arrowed to it.
  const [navigated, setNavigated] = useState(false);
  const chosen = new Set(value.map((v) => v.toLowerCase()));
  const q = query.trim().toLowerCase();
  const matches = suggestions
    .filter((s) => !chosen.has(s.toLowerCase()) && (!q || s.toLowerCase().includes(q)))
    .slice(0, 8);
  const exact = suggestions.some((s) => s.toLowerCase() === q);
  const full = value.length >= max;

  function add(raw: string) {
    const name = raw.trim().replace(/\s+/g, " ");
    if (!name || full || chosen.has(name.toLowerCase())) return;
    // Reuse the existing spelling when it only differs by case.
    const existing = suggestions.find((s) => s.toLowerCase() === name.toLowerCase());
    onChange([...value, existing ?? name]);
    setQuery("");
    setHighlight(0);
    setNavigated(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(e.key === "Enter" && navigated && matches[highlight] ? matches[highlight] : query);
    } else if (e.key === "Backspace" && !query && value.length) {
      onChange(value.slice(0, -1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (navigated ? Math.min(h + 1, matches.length - 1) : 0));
      setNavigated(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      setNavigated(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div className={cn("flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs", "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50")}>
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-0.5 pl-2.5 pr-1 text-xs font-medium text-primary">
            {t}
            <button type="button" onClick={() => onChange(value.filter((v) => v !== t))} aria-label={`Remove ${t}`}
              className="grid h-4 w-4 place-items-center rounded-full hover:bg-primary/20">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={query}
          disabled={full}
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder={full ? `Max ${max} tags` : value.length ? "Add another…" : "Type a tag and press Enter"}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0); setNavigated(false); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="min-w-[10rem] flex-1 bg-transparent px-1 py-0.5 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
      {open && !full && (matches.length > 0 || (q && !exact)) && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md">
          {matches.map((m, i) => (
            <li key={m} role="option" aria-selected={i === highlight}
              onMouseDown={(e) => { e.preventDefault(); add(m); }}
              onMouseEnter={() => { setHighlight(i); setNavigated(true); }}
              className={cn("cursor-pointer rounded-sm px-2 py-1.5", navigated && i === highlight && "bg-accent text-accent-foreground")}>
              {m}
            </li>
          ))}
          {q && !exact && (
            <li role="option" aria-selected={false} onMouseDown={(e) => { e.preventDefault(); add(query); }}
              className="cursor-pointer rounded-sm px-2 py-1.5 text-muted-foreground hover:bg-accent">
              Create &ldquo;{query.trim()}&rdquo;
            </li>
          )}
        </ul>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground">Up to {max}. Pick existing tags where you can so posts group together.</p>
    </div>
  );
}
