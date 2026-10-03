import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { validateUpload, UploadValidationError, readUploadForm } from "@/lib/uploads";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { s3, S3_BUCKET, publicUrlForKey } from "@/lib/s3";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user || session.user.role !== ADMIN_ROLES.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.adminProfile.findUnique({ where: { id: session.user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(profile.roles, PERMISSIONS.CONTENT_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Defense in depth: caps how fast a compromised/malicious admin session can
  // mint presigned S3 upload URLs, independent of the auth check above.
  if (!(await checkRateLimit(`admin-upload:${session.user.id}`, 60, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many uploads. Try again in a few minutes." }, { status: 429 });
  }

  const form = await readUploadForm(request).catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  try {
    const { bytes, type, extension } = await validateUpload(file);
    const key = `uploads/${crypto.randomUUID()}.${extension}`;
    await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: bytes,
      ContentType: type, ContentLength: bytes.byteLength,
      ContentDisposition: type === "application/pdf" ? "attachment" : "inline" }));
    return NextResponse.json({ publicUrl: publicUrlForKey(key) });
  } catch (error) {
    if (error instanceof UploadValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Admin upload failed", error);
    return NextResponse.json({ error: "Upload service unavailable" }, { status: 503 });
  }
}
