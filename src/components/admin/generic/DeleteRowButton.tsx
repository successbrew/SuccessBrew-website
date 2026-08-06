"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/admin/crud";

export function DeleteRowButton({ id, action }: { id: string; action: (formData: FormData) => Promise<ActionResult> }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this item? This can't be undone.")) return;
    const formData = new FormData();
    formData.set("id", id);
    startTransition(() => {
      void action(formData);
    });
  }

  return (
    <Button variant="destructive" size="sm" disabled={isPending} onClick={handleDelete}>
      Delete
    </Button>
  );
}
