"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminRole } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { inviteAdmin } from "./actions";

const ALL_ROLES = Object.values(AdminRole);

export function InviteAdminDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Set<AdminRole>>(new Set(["CONTENT_MANAGER"]));
  const [isPending, startTransition] = useTransition();

  function toggleRole(role: AdminRole, checked: boolean) {
    setRoles((prev) => {
      const next = new Set(prev);
      if (checked) next.add(role); else next.delete(role);
      return next;
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    roles.forEach((r) => formData.append("roles", r));
    startTransition(async () => {
      const result = await inviteAdmin(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setRoles(new Set(["CONTENT_MANAGER"]));
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite Admin</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a new admin</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="space-y-2 rounded-md border p-3">
              {ALL_ROLES.map((role) => (
                <div key={role} className="flex items-center justify-between">
                  <Label htmlFor={`role-${role}`} className="font-normal">
                    {ROLE_LABELS[role]}
                  </Label>
                  <Switch
                    id={`role-${role}`}
                    checked={roles.has(role)}
                    onCheckedChange={(checked) => toggleRole(role, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending invite…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
