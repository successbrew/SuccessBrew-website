"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type ActionResult = { success: true } | { error: string };

export function CreateSpeakerButton({
  applicationId,
  action,
}: {
  applicationId: string;
  action: (applicationId: string) => Promise<ActionResult>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await action(applicationId);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={isPending}>
        {isPending ? "Creating Speaker…" : "Create Speaker"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Generates a speaker ID, sends a welcome email, and notifies the team.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
