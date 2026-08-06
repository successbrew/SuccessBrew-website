"use client";

import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteRowButton } from "@/components/admin/generic/DeleteRowButton";
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
              <TableCell key={c.key}>{String(row[c.key] ?? "")}</TableCell>
            ))}
            <TableCell className="flex justify-end gap-2 text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`${editHrefBase}/${row.id}/edit`}>Edit</Link>
              </Button>
              <DeleteRowButton id={row.id} action={deleteAction} />
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
