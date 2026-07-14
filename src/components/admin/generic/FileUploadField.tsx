"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function FileUploadField({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const presignRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (!presignRes.ok) {
        const body = await presignRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to get upload URL");
      }
      const { uploadUrl, publicUrl } = await presignRes.json();

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");

      onChange(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-block max-w-full truncate text-sm font-medium text-primary underline underline-offset-2"
        >
          {value.split("/").pop()}
        </a>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Uploading…" : value ? "Replace PDF" : "Upload PDF"}
        </Button>
        {value && !isUploading && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Remove
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
