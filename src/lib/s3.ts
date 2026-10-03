import { GetObjectCommand, GetPublicAccessBlockCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME!;

// Public marketing and private user files must use different buckets.
export function privateBucket(): string {
  const bucket = process.env.AWS_S3_PRIVATE_BUCKET_NAME;
  if (!bucket || bucket === S3_BUCKET) throw new Error("A separate private S3 bucket is required");
  return bucket;
}

export async function assertPrivateStorage(): Promise<string> {
  const bucket = privateBucket();
  const { PublicAccessBlockConfiguration: block } = await s3.send(new GetPublicAccessBlockCommand({ Bucket: bucket }));
  if (!block?.BlockPublicAcls || !block.IgnorePublicAcls || !block.BlockPublicPolicy || !block.RestrictPublicBuckets) {
    throw new Error("Private S3 bucket must enable all Block Public Access settings");
  }
  return bucket;
}

export function publicUrlForKey(key: string) {
  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export function privateObjectKey(stored: string): string {
  let key = stored;
  if (/^https?:\/\//i.test(stored)) {
    const url = new URL(stored);
    const buckets = [S3_BUCKET, process.env.AWS_S3_PRIVATE_BUCKET_NAME].filter(Boolean);
    const allowed = buckets.flatMap(bucket => [`${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`, `${bucket}.s3.amazonaws.com`]);
    if (url.protocol !== "https:" || !allowed.includes(url.hostname) || url.port || url.username || url.password) throw new Error("Untrusted private file URL");
    key = decodeURIComponent(url.pathname.slice(1));
  }
  if (!/^(applications\/uploads|digests)\/[a-zA-Z0-9_./-]+$/.test(key) || key.split("/").some(part => part === ".." || part === ".")) {
    throw new Error("Invalid private object key");
  }
  return key;
}

/** Call only after verifying access to the owning application or digest recipient. */
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
  const canonicalKey = privateObjectKey(key);
  const bucket = await assertPrivateStorage();
  return getSignedUrl(s3, new GetObjectCommand({
    Bucket: bucket, Key: canonicalKey,
    ResponseContentDisposition: "attachment",
    ResponseCacheControl: "private, no-store",
  }), { expiresIn: Math.min(Math.max(expiresInSeconds, 1), 604800) });
}

export async function resolveDownloadUrl(stored: string, expiresInSeconds = 900): Promise<string> {
  return getSignedDownloadUrl(privateObjectKey(stored), expiresInSeconds);
}
