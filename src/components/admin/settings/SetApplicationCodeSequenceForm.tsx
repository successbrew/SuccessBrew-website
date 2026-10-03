"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatApplicationCode } from "@/lib/services/applications/code-generator-format";

type ActionResult = { success: true; newValue: number } | { error: string };

export function SetApplicationCodeSequenceForm({
  action,
  currentLastNumber,
  minimum,
  year,
}: {
  action: (lastNumber: number) => Promise<ActionResult>;
  currentLastNumber: number;
  minimum: number;
  year: number;
}) {
  const [value, setValue] = useState(String(currentLastNumber));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsed = Number(value);
  const isValid = value.trim() !== "" && Number.isInteger(parsed) && parsed >= minimum;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError(null);
    setSaved(null);
    startTransition(async () => {
      const result = await action(parsed);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSaved(result.newValue);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="last-number">Last code issued (number)</Label>
        <Input
          id="last-number"
          type="number"
          inputMode="numeric"
          min={minimum}
          step={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(null);
          }}
        />
      </div>
      {isValid ? (
        <p className="text-sm text-muted-foreground">
          The next application will get <strong>{formatApplicationCode(year, parsed + 1)}</strong>.
        </p>
      ) : (
        <p className="text-sm text-destructive">Enter a whole number of {minimum} or more.</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved !== null && <p className="text-sm text-green-700">Counter set to {saved}.</p>}
      <Button type="submit" size="sm" disabled={!isValid || isPending || parsed === currentLastNumber}>
        {isPending ? "Saving…" : "Set Counter"}
      </Button>
    </form>
  );
}
