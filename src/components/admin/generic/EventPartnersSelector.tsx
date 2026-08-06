/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PartnerOption {
  id: string;
  name: string;
  logoUrl: string;
}

export function EventPartnersSelector({
  allPartners,
  selectedIds,
  action,
}: {
  allPartners: PartnerOption[];
  selectedIds: string[];
  action: (formData: FormData) => Promise<{ success: true }>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    const formData = new FormData();
    selected.forEach((id) => formData.append("partnerIds", id));
    startTransition(async () => {
      await action(formData);
      setSaved(true);
    });
  }

  return (
    <div className="space-y-3">
      {allPartners.length === 0 ? (
        <p className="text-sm text-muted-foreground">No community partners yet.</p>
      ) : (
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-3">
          {allPartners.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-1.5">
              <div className="flex items-center gap-2.5">
                <img src={p.logoUrl} alt={p.name} className="h-6 w-auto object-contain" />
                <Label htmlFor={`partner-${p.id}`} className="font-normal">{p.name}</Label>
              </div>
              <Switch
                id={`partner-${p.id}`}
                checked={selected.has(p.id)}
                onCheckedChange={(checked) => toggle(p.id, checked)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save Partners"}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">Saved.</span>}
        <Link href="/sbh-1111/community-partners/new" className="text-sm text-primary underline underline-offset-2">
          + Add New Partner
        </Link>
      </div>
    </div>
  );
}
