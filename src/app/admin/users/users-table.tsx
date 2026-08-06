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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AdminRole } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { updateAdminRoles, removeAdmin } from "./actions";

type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  roles: AdminRole[];
};

const ALL_ROLES = Object.values(AdminRole);

export function UsersTable({
  admins,
  currentAdminId,
}: {
  admins: AdminUser[];
  currentAdminId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function toggleRole(userId: string, currentRoles: AdminRole[], role: AdminRole, checked: boolean) {
    const next = checked
      ? [...currentRoles, role]
      : currentRoles.filter((r) => r !== role);
    if (next.length === 0) return; // an admin must always keep at least one role

    const formData = new FormData();
    formData.set("userId", userId);
    next.forEach((r) => formData.append("roles", r));
    startTransition(() => {
      void updateAdminRoles(formData);
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
          <TableHead>Roles</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((u) => (
          <TableRow key={u.id}>
            <TableCell>{u.name || "—"}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {u.roles.map((role) => (
                  <Badge key={role} variant={role === "SUPER_ADMIN" ? "default" : "secondary"}>
                    {ROLE_LABELS[role]}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="flex justify-end gap-2 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isPending || u.id === currentAdminId}>
                    Edit Roles
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Roles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_ROLES.map((role) => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={u.roles.includes(role)}
                      onCheckedChange={(checked) => toggleRole(u.id, u.roles, role, checked === true)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {ROLE_LABELS[role]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
