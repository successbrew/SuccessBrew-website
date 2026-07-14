import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { s3, S3_BUCKET, publicUrlForKey } from "@/lib/s3";

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "application/pdf",
]);

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user || session.user.role !== ADMIN_ROLES.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.adminProfile.findUnique({ where: { id: session.user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileName, fileType } = await request.json();
  if (typeof fileName !== "string" || typeof fileType !== "string" || !ALLOWED_TYPES.has(fileType)) {
    return NextResponse.json({ error: "Invalid file name or type" }, { status: 400 });
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${crypto.randomUUID()}-${safeName}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: fileType }),
    { expiresIn: 60 }
  );

  return NextResponse.json({ uploadUrl, publicUrl: publicUrlForKey(key) });
}
