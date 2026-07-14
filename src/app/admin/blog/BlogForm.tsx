"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/blog/RichTextEditor";
import { blogSchema, slugify, type BlogInput } from "@/lib/admin/schemas/blog";
import type { ActionResult } from "@/lib/admin/crud";

type BlogFormValues = {
  title: string;
  slug: string;
  coverImageUrl: string;
  excerpt: string;
  body: JSONContent;
  status: "DRAFT" | "PUBLISHED";
};

export function BlogForm({
  defaultValues,
  action,
}: {
  defaultValues: BlogFormValues;
  action: (input: BlogInput) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [values, setValues] = useState(defaultValues);
  const [slugTouched, setSlugTouched] = useState(!!defaultValues.slug);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = blogSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(", "));
      return;
    }

    startTransition(async () => {
      const result = await action(parsed.data);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => {
            const title = e.target.value;
            setValues((v) => ({
              ...v,
              title,
              slug: slugTouched ? v.slug : slugify(title),
            }));
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setValues((v) => ({ ...v, slug: e.target.value }));
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">Cover Image URL</Label>
        <Input
          id="coverImageUrl"
          value={values.coverImageUrl}
          onChange={(e) => setValues((v) => ({ ...v, coverImageUrl: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          rows={3}
          value={values.excerpt}
          onChange={(e) => setValues((v) => ({ ...v, excerpt: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Body</Label>
        <RichTextEditor
          value={values.body}
          onChange={(body) => setValues((v) => ({ ...v, body }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={values.status}
          onValueChange={(status) => setValues((v) => ({ ...v, status: status as "DRAFT" | "PUBLISHED" }))}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
