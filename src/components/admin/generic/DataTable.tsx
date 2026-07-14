"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ColumnConfig } from "@/lib/admin/field-types";
import type { ActionResult } from "@/lib/admin/crud";

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  editHrefBase,
  deleteAction,
}: {
  rows: T[];
  columns: ColumnConfig<T>[];
  editHrefBase: string;
  deleteAction: (formData: FormData) => Promise<ActionResult>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this item? This can't be undone.")) return;
    const formData = new FormData();
    formData.set("id", id);
    startTransition(() => {
      void deleteAction(formData);
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={c.key}>{c.label}</TableHead>
          ))}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {columns.map((c) => (
              <TableCell key={c.key}>
                {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
              </TableCell>
            ))}
            <TableCell className="flex justify-end gap-2 text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`${editHrefBase}/${row.id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => handleDelete(row.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground">
              No items yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
