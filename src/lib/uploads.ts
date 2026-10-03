import sharp from "sharp";
import { createHash } from "node:crypto";

export class UploadValidationError extends Error {}

export async function readUploadForm(request: Request): Promise<FormData> {
  const maxBody = 10 * 1024 * 1024 + 64 * 1024;
  const reader = request.body?.getReader();
  if (!reader) throw new UploadValidationError("Missing upload body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBody) {
        await reader.cancel();
        throw new UploadValidationError("Upload body is too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new Response(new Uint8Array(Buffer.concat(chunks)), {
    headers: { "content-type": request.headers.get("content-type") ?? "" },
  }).formData();
}

/** Uploaded bytes stay quarantined in server memory until validation completes. */
export async function validateUpload(file: File): Promise<{ bytes: Buffer; type: string; extension: string }> {
  if (file.size < 1 || file.size > 10 * 1024 * 1024) throw new UploadValidationError("File must be between 1 byte and 10 MB");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (file.type === "application/pdf") {
    if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-")) || !bytes.subarray(-1024).includes(Buffer.from("%%EOF"))) {
      throw new UploadValidationError("Invalid PDF contents");
    }
    // Contract: a trusted private scanning service returns the verdict bound to
    // these exact bytes. Missing service, timeouts, and ambiguous results fail closed.
    const endpoint = process.env.DOCUMENT_SCAN_URL;
    const token = process.env.DOCUMENT_SCAN_TOKEN;
    if (!endpoint || !token || new URL(endpoint).protocol !== "https:") throw new Error("Document scanning is not configured");
    const response = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/pdf", Authorization: `Bearer ${token}` },
      body: new Uint8Array(bytes), redirect: "error", signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error("Document scanner unavailable");
    const verdict = await response.json();
    if (verdict.clean !== true || verdict.sha256 !== createHash("sha256").update(bytes).digest("hex")) {
      throw new UploadValidationError("Document failed security scanning");
    }
    return { bytes, type: "application/pdf", extension: "pdf" };
  }
  const formats: Record<string, string> = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  if (!formats[file.type]) throw new UploadValidationError("Unsupported file type");
  try {
    const image = sharp(bytes, { limitInputPixels: 25_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    if (metadata.format !== formats[file.type]) throw new Error("Type mismatch");
    // Decode and re-encode, removing metadata, appended payloads and animation.
    return { bytes: await image.rotate().webp().toBuffer(), type: "image/webp", extension: "webp" };
  } catch {
    throw new UploadValidationError("Invalid image contents");
  }
}
