"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { RunDailyDigestResult } from "@/lib/digest/run-daily-digest";

type ActionResult = { success: true; result?: RunDailyDigestResult } | { error: string };

export function SendDigestNowButton({ action }: { action: () => Promise<ActionResult> }) {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunDailyDigestResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await action();
      if ("error" in res) setError(res.error);
      else if (res.result) setResult(res.result);
    });
  }

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <Button onClick={handleClick} disabled={isPending}>
        {isPending ? "Running…" : "Send today's digest now"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Generates any missing topic briefs and emails every eligible paid member who hasn&apos;t received today&apos;s
        digest yet. Safe to click more than once — already-delivered members and already-generated briefs are skipped.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <p className="text-sm text-muted-foreground">
          Topics: {result.topicsGenerated} generated, {result.topicsFailed} failed &middot; Members: {result.sent} sent,{" "}
          {result.failed} failed, {result.skippedNoTopics} skipped (no topics), {result.skippedAlreadyDelivered} already
          delivered.
        </p>
      )}
    </div>
  );
}
