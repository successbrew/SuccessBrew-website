"use client";

import { useState } from "react";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Returns the uploaded file's opaque S3 key (not a public URL — see H5). */
  async function upload(file: File): Promise<string | null> {
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/apply/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Upload failed");
      }
      const { key } = await res.json();
      return key as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading, error };
}
