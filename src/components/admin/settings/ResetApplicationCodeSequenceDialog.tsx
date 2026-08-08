"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ActionResult = { success: true; newValue: number } | { error: string };

const CONFIRM_PHRASE = "RESET";

export function ResetApplicationCodeSequenceDialog({
  action,
  nextCodePreview,
}: {
  action: () => Promise<ActionResult>;
  nextCodePreview: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setStep(1);
    setConfirmText("");
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleReset() {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      handleOpenChange(false);
    });
  }

  const phraseMatches = confirmText.trim().toUpperCase() === CONFIRM_PHRASE;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Reset Numbering
      </Button>
      <DialogContent>
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Reset the application code counter?</DialogTitle>
              <DialogDescription>
                The next application submitted will be assigned <strong>{nextCodePreview}</strong>. Codes already
                issued are not changed by this — resetting mid-year can make numbering look out of order.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => setStep(2)}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Type {CONFIRM_PHRASE} to confirm</DialogTitle>
              <DialogDescription>
                Type <strong>{CONFIRM_PHRASE}</strong> below to restart the counter at 001. This can&rsquo;t be
                undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="confirm-reset">Confirmation</Label>
              <Input
                id="confirm-reset"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                autoComplete="off"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button variant="destructive" disabled={!phraseMatches || isPending} onClick={handleReset}>
                {isPending ? "Resetting…" : "Reset Counter"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
