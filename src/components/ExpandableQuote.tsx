/* eslint-disable @next/next/no-img-element */
"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

/** Quote text with line breaks and repeated spaces collapsed to single spaces. */
function flatten(quote: string): string {
  return quote.trim().replace(/\s+/g, " ");
}

/** Preview of a quote: as many whole sentences as fit in `maxLen`, so long
 * testimonials still fill their card instead of collapsing to one short opening
 * sentence. Falls back to a hard cut with "…" if even the first sentence is too long. */
export function extractMainLine(quote: string, maxLen = 150): string {
  const text = flatten(quote);
  if (text.length <= maxLen) return text;
  const sentences = text.match(/[^.!?]+[.!?]+["”’)]*(?:\s|$)|[^.!?]+$/g) ?? [text];
  let preview = "";
  let used = 0;
  for (const s of sentences) {
    if ((preview + s).trim().length > maxLen) break;
    preview += s;
    used++;
  }
  // If whole sentences only filled a little of the space (a short opener
  // followed by a long sentence), run into the next one and cut at a word.
  if (preview.trim().length < maxLen * 0.6 && used < sentences.length) {
    const cut = (preview + sentences[used]).slice(0, maxLen);
    preview = cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "") + "…";
  }
  preview = preview.trim();
  return preview || text.slice(0, maxLen).trimEnd() + "…";
}

export function ExpandableQuote({
  quote,
  name,
  role,
  initial,
  avatarUrl,
  quoteClassName,
  readMoreClassName,
  onOpenChange,
  withQuoteMarks = true,
  previewLength,
}: {
  quote: string;
  name: string;
  role: string;
  initial: string;
  avatarUrl?: string | null;
  quoteClassName?: string;
  readMoreClassName?: string;
  onOpenChange?: (open: boolean) => void;
  withQuoteMarks?: boolean;
  /** Max characters shown before "Read more" (default 150). */
  previewLength?: number;
}) {
  const mainLine = extractMainLine(quote, previewLength);
  const isTruncated = mainLine !== flatten(quote);

  return (
    <>
      <span className={quoteClassName}>{withQuoteMarks ? <>&quot;{mainLine}&quot;</> : mainLine}</span>
      {isTruncated && (
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className={
                readMoreClassName ??
                "mt-2 inline-block text-xs font-semibold underline underline-offset-2 opacity-70 transition hover:opacity-100"
              }
            >
              Read more
            </button>
          </DialogTrigger>
          <DialogContent
            className="max-h-[80vh] overflow-y-auto bg-background text-ink sm:max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <blockquote className="whitespace-pre-line text-base leading-relaxed">{quote}</blockquote>
            <div className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {initial}
                </span>
              )}
              <div>
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-xs text-ink/50">{role}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
