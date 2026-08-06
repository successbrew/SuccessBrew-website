"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ActionResult = { success: true } | { error: string };

export function ApplicationReviewForm({
  applicationId,
  action,
}: {
  applicationId: string;
  action: (applicationId: string, formData: FormData) => Promise<ActionResult>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(applicationId, formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-3">
        <Label htmlFor="score" className="shrink-0">Score (1-5)</Label>
        <Input id="score" name="score" type="number" min={1} max={5} className="w-20" />
      </div>
      <Textarea id="notes" name="notes" rows={3} placeholder="Internal note — not visible to the applicant" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "Saving…" : "Add Note"}
      </Button>
    </form>
  );
}
