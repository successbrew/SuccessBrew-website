import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, S3_BUCKET, publicUrlForKey } from "@/lib/s3";
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
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!checkRateLimit(`apply-upload:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many uploads. Try again in a few minutes." }, { status: 429 });
  }

  const formData = await request.formData().catch(() => null);
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

  const bytes = new Uint8Array(await file.arrayBuffer());

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `applications/uploads/${crypto.randomUUID()}-${safeName}`;

  await s3.send(
    new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: bytes, ContentType: file.type, ContentLength: bytes.byteLength })
  );

  return NextResponse.json({ url: publicUrlForKey(key) });
}
