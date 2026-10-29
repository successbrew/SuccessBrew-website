"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteTag, mergeTag, updateTag } from "../actions";
import type { ActionResult } from "@/lib/admin/crud";
import { blogTagPath } from "@/lib/blog-format";

interface TagRow { id: string; name: string; slug: string; description: string; total: number; published: number }

function TagRowView({ tag, others }: { tag: TagRow; others: TagRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [description, setDescription] = useState(tag.description);
  const [mergeInto, setMergeInto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(fn: () => Promise<ActionResult>, after?: () => void) {
    setError(null);
    start(async () => {
      const result = await fn();
      if ("error" in result) { setError(result.error); return; }
      after?.();
      router.refresh();
    });
  }

  return (
    <TableRow className="align-top">
      <TableCell className="min-w-[14rem]">
        {editing ? (
          <div className="space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Tag name" />
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional intro for the tag's public page" aria-label="Tag description" />
            <div className="flex gap-2">
              <Button size="sm" disabled={pending} onClick={() => run(() => updateTag(tag.id, { name, description }), () => setEditing(false))}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(tag.name); setDescription(tag.description); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-medium">{tag.name}</p>
            {tag.description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{tag.description}</p>}
          </div>
        )}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {tag.published > 0 ? <a href={blogTagPath(tag.slug)} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">{blogTagPath(tag.slug)}</a> : tag.slug}
      </TableCell>
      <TableCell>{tag.published} <span className="text-muted-foreground">/ {tag.total}</span></TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>}
          {others.length > 0 && (
            <div className="flex items-center gap-1">
              <select value={mergeInto} onChange={(e) => setMergeInto(e.target.value)} aria-label={`Merge ${tag.name} into`}
                className="h-8 rounded-md border border-input bg-transparent px-2 text-xs">
                <option value="">Merge into…</option>
                {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <Button size="sm" variant="outline" disabled={!mergeInto || pending}
                onClick={() => {
                  const target = others.find((o) => o.id === mergeInto);
                  if (target && confirm(`Move all posts from "${tag.name}" to "${target.name}" and remove "${tag.name}"?`)) {
                    run(() => mergeTag(tag.id, mergeInto));
                  }
                }}>
                Merge
              </Button>
            </div>
          )}
          <Button size="sm" variant="destructive" disabled={pending}
            onClick={() => {
              if (!confirm(`Delete "${tag.name}"? It's removed from ${tag.total} post(s); the posts stay.`)) return;
              const fd = new FormData();
              fd.set("id", tag.id);
              run(() => deleteTag(fd));
            }}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function TagManager({ tags }: { tags: TagRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tag</TableHead>
          <TableHead>Page</TableHead>
          <TableHead>Posts (live / all)</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tags.map((t) => <TagRowView key={t.id} tag={t} others={tags.filter((o) => o.id !== t.id)} />)}
        {tags.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No tags yet — add some from the post editor.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
