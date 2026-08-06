import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
 * type allowlist + size cap + per-IP rate limit are what keep this endpoint from
 * becoming an open relay into the bucket.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!checkRateLimit(`apply-upload:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many uploads. Try again in a few minutes." }, { status: 429 });
  }

  const { fileName, fileType, fileSize } = await request.json();
  if (typeof fileName !== "string" || typeof fileType !== "string" || !ALLOWED_TYPES.has(fileType)) {
    return NextResponse.json({ error: "Invalid file name or type" }, { status: 400 });
  }
  if (typeof fileSize !== "number" || !Number.isInteger(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 10 MB" }, { status: 400 });
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `applications/uploads/${crypto.randomUUID()}-${safeName}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: fileType, ContentLength: fileSize }),
    { expiresIn: 60 }
  );

  return NextResponse.json({ uploadUrl, publicUrl: publicUrlForKey(key) });
}
