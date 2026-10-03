import { validateUpload, UploadValidationError, readUploadForm } from "@/lib/uploads";
import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, assertPrivateStorage } from "@/lib/s3";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Unauthenticated by design: applicants upload their headshot/resume/deck/logo
 * before the login gate at final submit (see src/app/apply/actions.ts). The
 * file body is read here and pushed to S3 from the server — the browser never
 * gets bucket credentials or a direct write URL, so this is the only place
 * bytes can land in the bucket, and the type allowlist + size cap + per-IP
 * rate limit are what keep it from being spammed.
 *
 * Returns the bare object key, not a public URL (H5 fix) — these are
 * resumes/decks/headshots, not public marketing assets. Whoever needs to
 * view one later (an admin reviewing the application) resolves the key to a
 * short-lived signed URL at render time via resolveDownloadUrl().
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!(await checkRateLimit(`apply-upload:${ip}`, 20, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many uploads. Try again in a few minutes." }, { status: 429 });
  }

  const formData = await readUploadForm(request).catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 10 MB" }, { status: 400 });
  }

  try {
    const { bytes, type, extension } = await validateUpload(file);
    const key = `applications/uploads/${crypto.randomUUID()}.${extension}`;
    await s3.send(new PutObjectCommand({ Bucket: await assertPrivateStorage(), Key: key,
      Body: bytes, ContentType: type, ContentLength: bytes.byteLength, ContentDisposition: "attachment" }));
    return NextResponse.json({ key });
  } catch (error) {
    if (error instanceof UploadValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Application upload failed", error);
    return NextResponse.json({ error: "Upload service unavailable" }, { status: 503 });
  }
}
