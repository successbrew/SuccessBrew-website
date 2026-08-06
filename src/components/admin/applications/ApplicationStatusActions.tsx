"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/services/applications/status-transitions";

type ActionResult = { success: true } | { error: string };

export function ApplicationStatusActions({
  applicationId,
  options,
  action,
}: {
  applicationId: string;
  options: ApplicationStatus[];
  action: (applicationId: string, toStatus: ApplicationStatus, note: string) => Promise<ActionResult>;
}) {
  const [toStatus, setToStatus] = useState<ApplicationStatus | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!toStatus) return;
    setError(null);
    startTransition(async () => {
      const result = await action(applicationId, toStatus, note);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setNote("");
      setToStatus("");
    });
  }

  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">This application is in a final state — no further status changes available.</p>;
  }

  return (
    <div className="space-y-3">
      <Select value={toStatus} onValueChange={(v) => setToStatus(v as ApplicationStatus)}>
        <SelectTrigger>
          <SelectValue placeholder="Move to…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((status) => (
            <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Note (optional) — e.g. reason for rejection, what info is needed, interview date"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button onClick={handleSubmit} disabled={!toStatus || isPending}>
        {isPending ? "Updating…" : "Update Status"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
