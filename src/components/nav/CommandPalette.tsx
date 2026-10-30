"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { navIndex } from "@/components/nav/nav-data";

type Entry = ReturnType<typeof navIndex>[number];

const SUGGESTED = ["Blogs", "Events", "Selected Work", "Our Story"];

/** ⌘K / Ctrl+K page search across everything in the navigation. Scales to any
 * number of pages: type to filter, arrows to move, Enter to go. */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const all = useMemo(() => {
    const entries = navIndex();
    // A section's home link is redundant when one of its items already points there.
    const itemHrefs = new Set(entries.filter((e) => e.group).map((e) => e.href));
    return entries.filter((e) => e.group || !itemHrefs.has(e.href));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all.filter((e) => SUGGESTED.includes(e.title));
    const score = (e: Entry) => {
      const t = e.title.toLowerCase();
      if (t.startsWith(q)) return 0;
      if (t.includes(q)) return 1;
      if (`${e.desc} ${e.group} ${e.section}`.toLowerCase().includes(q)) return 2;
      return 9;
    };
    return all.map((e) => ({ e, s: score(e) })).filter((x) => x.s < 9).sort((a, b) => a.s - b.s).map((x) => x.e);
  }, [all, query]);

  // Group in result order, keeping each section together.
  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    results.forEach((r) => map.set(r.section, [...(map.get(r.section) ?? []), r]));
    return [...map.entries()];
  }, [results]);
  const flat = grouped.flatMap(([, list]) => list);

  function go(e: Entry | undefined) {
    if (!e) return;
    onOpenChange(false);
    setQuery("");
    router.push(e.href);
  }

  function onKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      const next = (active + (ev.key === "ArrowDown" ? 1 : -1) + flat.length) % Math.max(flat.length, 1);
      setActive(next);
      listRef.current?.querySelector(`[data-idx="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      go(flat[active]);
    }
  }

  let idx = -1;
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setQuery(""); setActive(0); } }}>
      <DialogContent showCloseButton={false} onKeyDown={onKeyDown}
        className="top-[12vh] max-w-[calc(100%-2rem)] translate-y-0 gap-0 overflow-hidden rounded-2xl border-[#111111]/10 bg-white p-0 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)] sm:max-w-xl">
        <DialogTitle className="sr-only">Search Successbrew</DialogTitle>
        <DialogDescription className="sr-only">Type to find any page, use the arrow keys to move and Enter to open it.</DialogDescription>
        <div className="flex items-center gap-3 border-b border-[#111111]/8 px-4">
          <Search className="h-4 w-4 shrink-0 text-[#111111]/40" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Search pages — blogs, events, case studies…"
            aria-label="Search pages"
            aria-activedescendant={flat[active] ? `cmd-${active}` : undefined}
            className="h-14 flex-1 bg-transparent text-[15px] text-[#111111] outline-none placeholder:text-[#111111]/40"
          />
          <kbd className="rounded-md border border-[#111111]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#111111]/45">ESC</kbd>
        </div>

        <div ref={listRef} role="listbox" aria-label="Pages" className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <p className="text-sm font-semibold text-[#111111]">No pages match &ldquo;{query}&rdquo;.</p>
              <p className="mt-1 text-xs text-[#111111]/50">Try one of these:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTED.map((s) => (
                  <button key={s} type="button" onClick={() => { setQuery(s); setActive(0); }}
                    className="rounded-full border border-[#111111]/12 px-3 py-1 text-xs font-semibold text-[#111111]/70 hover:border-[#003CD1] hover:text-[#003CD1]">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            grouped.map(([section, list]) => (
              <div key={section} className="mb-1">
                <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111111]/40">
                  {query.trim() ? section : "Suggested"}
                </p>
                {list.map((e) => {
                  idx += 1;
                  const i = idx;
                  const on = i === active;
                  const Icon = e.icon;
                  return (
                    <button key={e.href + e.title} id={`cmd-${i}`} data-idx={i} type="button" role="option" aria-selected={on}
                      onMouseMove={() => setActive(i)} onClick={() => go(e)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${on ? "bg-[#003CD1] text-white" : "text-[#111111] hover:bg-[#F5F5F3]"}`}>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${on ? "bg-white/15" : "bg-[#003CD1]/8"}`}>
                        {Icon ? <Icon className={`h-4 w-4 ${on ? "text-white" : "text-[#003CD1]"}`} /> : <ArrowRight className={`h-4 w-4 ${on ? "text-white" : "text-[#003CD1]"}`} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          {e.title}
                          {e.soon && <span className={`rounded-full px-1.5 py-px text-[9px] font-bold uppercase ${on ? "bg-white/20" : "bg-[#111111]/8 text-[#111111]/55"}`}>Soon</span>}
                        </span>
                        <span className={`block truncate text-xs ${on ? "text-white/70" : "text-[#111111]/50"}`}>
                          {e.group ? `${e.section} · ${e.desc}` : e.desc}
                        </span>
                      </span>
                      {on && <CornerDownLeft className="h-4 w-4 shrink-0 text-white/70" aria-hidden />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-[#111111]/8 bg-[#F9F9F8] px-4 py-2.5 text-[11px] text-[#111111]/45">
          <span><kbd className="font-semibold">↑↓</kbd> move</span>
          <span><kbd className="font-semibold">↵</kbd> open</span>
          <span><kbd className="font-semibold">esc</kbd> close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
