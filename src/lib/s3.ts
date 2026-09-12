import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME!;

/** For genuinely public, admin-authored marketing assets only (blog covers,
 * partner logos, etc. — see api/admin/upload) — content that's meant to be
 * visible on the public site regardless of who requests it. NEVER use this
 * for application documents or digest PDFs; those must go through
 * getSignedDownloadUrl/resolveDownloadUrl instead (see H5 in the security
 * audit — those object kinds used to get permanent public URLs here too). */
export function publicUrlForKey(key: string) {
  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

/** Mints a short-lived signed GET URL for a private object — the key itself
 * being opaque/random is not sufficient on its own if the bucket (or a CDN in
 * front of it) is ever public-read, so treat every private object as
 * access-controlled only via a freshly-minted, time-limited link like this. */
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn: expiresInSeconds });
}

/**
 * Resolves a stored Document.url / personal.headshotUrl / DigestDelivery.pdfUrl
 * value into a URL usable right now. Rows written before this object storage
 * was locked down (H5) still hold a full public bucket URL — those are
 * returned as-is (still reachable only because the bucket policy hasn't been
 * migrated to private yet; see the audit's H5 note on migrating the bucket
 * itself, which is an AWS-console/infra change outside this codebase). Rows
 * written after hold a bare S3 key, which is signed on demand so the object
 * is only ever reachable via a short-lived link minted for an authorized
 * viewer, never a permanent public URL.
 */
export async function resolveDownloadUrl(stored: string, expiresInSeconds = 900): Promise<string> {
  if (/^https?:\/\//i.test(stored)) return stored;
  return getSignedDownloadUrl(stored, expiresInSeconds);
}
