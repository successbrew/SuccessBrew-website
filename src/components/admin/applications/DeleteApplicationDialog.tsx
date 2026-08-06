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

type ActionResult = { success: true } | { error: string };

export function DeleteApplicationDialog({
  applicationId,
  applicantName,
  applicationCode,
  counts,
  action,
}: {
  applicationId: string;
  applicantName: string;
  applicationCode: string;
  counts: { documents: number; reviews: number; statusHistory: number; activityLog: number };
  action: (applicationId: string) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
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

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await action(applicationId);
      // A successful delete redirects server-side and never resolves here with
      // a value — only a failure path returns to this component.
      if (result && "error" in result) setError(result.error);
    });
  }

  const nameMatches = confirmText.trim().toLowerCase() === applicantName.trim().toLowerCase();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Delete Application
      </Button>
      <DialogContent>
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Delete {applicantName}&rsquo;s application?</DialogTitle>
              <DialogDescription>
                This permanently erases their application ({applicationCode}) and everything attached to it. This
                cannot be undone — there is no archive or recovery for this action.
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
              <DialogTitle>Here&rsquo;s exactly what gets deleted</DialogTitle>
              <DialogDescription>Review before continuing — none of this is recoverable afterward.</DialogDescription>
            </DialogHeader>
            <ul className="space-y-1.5 text-sm">
              <li>The application record itself ({applicationCode})</li>
              <li>{counts.documents} uploaded document{counts.documents !== 1 ? "s" : ""}</li>
              <li>{counts.reviews} internal review note{counts.reviews !== 1 ? "s" : ""}</li>
              <li>{counts.statusHistory} status history entr{counts.statusHistory !== 1 ? "ies" : "y"}</li>
              <li>{counts.activityLog} activity log entr{counts.activityLog !== 1 ? "ies" : "y"}</li>
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button variant="destructive" onClick={() => setStep(3)}>I understand, continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Type the applicant&rsquo;s name to confirm</DialogTitle>
              <DialogDescription>
                Type <strong>{applicantName}</strong> below to permanently delete this application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="confirm-name">Applicant name</Label>
              <Input
                id="confirm-name"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={applicantName}
                autoComplete="off"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button variant="destructive" disabled={!nameMatches || isPending} onClick={handleDelete}>
                {isPending ? "Deleting…" : "Permanently Delete"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
