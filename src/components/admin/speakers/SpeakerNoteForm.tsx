"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ActionResult = { success: true } | { error: string };

export function SpeakerNoteForm({
  speakerId,
  action,
}: {
  speakerId: string;
  action: (speakerId: string, formData: FormData) => Promise<ActionResult>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(speakerId, formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <Textarea name="note" rows={3} placeholder="Internal note — podcast scheduling, follow-ups, anything not shown publicly" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "Saving…" : "Add Note"}
      </Button>
    </form>
  );
}
