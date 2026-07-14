"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

/** First line/sentence of a quote, capped so cards stay a consistent size regardless of how long the full testimonial is. */
export function extractMainLine(quote: string, maxLen = 150): string {
  const firstBlock = quote.trim().split(/\n+/)[0].trim();
  if (firstBlock.length <= maxLen) return firstBlock;
  const sentenceMatch = firstBlock.slice(0, maxLen + 60).match(/^.*?[.!?](?=\s|$)/);
  if (sentenceMatch) return sentenceMatch[0].trim();
  return firstBlock.slice(0, maxLen).trimEnd() + "…";
}

export function ExpandableQuote({
  quote,
  name,
  role,
  initial,
  quoteClassName,
  readMoreClassName,
  onOpenChange,
  withQuoteMarks = true,
}: {
  quote: string;
  name: string;
  role: string;
  initial: string;
  quoteClassName?: string;
  readMoreClassName?: string;
  onOpenChange?: (open: boolean) => void;
  withQuoteMarks?: boolean;
}) {
  const mainLine = extractMainLine(quote);
  const isTruncated = mainLine !== quote.trim();

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
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initial}
              </span>
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
