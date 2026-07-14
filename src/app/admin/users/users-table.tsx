"use client";

import { useTransition } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminTier } from "@prisma/client";
import { updateAdminTier, removeAdmin } from "./actions";

type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  tier: AdminTier;
};

export function UsersTable({
  admins,
  currentAdminId,
}: {
  admins: AdminUser[];
  currentAdminId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function toggleTier(userId: string, currentTier: AdminTier) {
    const nextTier: AdminTier =
      currentTier === AdminTier.SUPER_ADMIN ? AdminTier.EDITOR : AdminTier.SUPER_ADMIN;
    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("tier", nextTier);
    startTransition(() => {
      void updateAdminTier(formData);
    });
  }

  function handleRemove(userId: string) {
    if (!confirm("Remove this admin's access? This deletes their account.")) return;
    const formData = new FormData();
    formData.set("userId", userId);
    startTransition(() => {
      void removeAdmin(formData);
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((u) => (
          <TableRow key={u.id}>
            <TableCell>{u.name || "—"}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              <Badge variant={u.tier === AdminTier.SUPER_ADMIN ? "default" : "secondary"}>
                {u.tier === AdminTier.SUPER_ADMIN ? "Super Admin" : "Editor"}
              </Badge>
            </TableCell>
            <TableCell className="flex justify-end gap-2 text-right">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending || u.id === currentAdminId}
                onClick={() => toggleTier(u.id, u.tier)}
              >
                {u.tier === AdminTier.SUPER_ADMIN ? "Make Editor" : "Make Super Admin"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending || u.id === currentAdminId}
                onClick={() => handleRemove(u.id)}
              >
                Remove
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {admins.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No admins yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
