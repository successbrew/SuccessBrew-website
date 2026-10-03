import { CopyObjectCommand, GetBucketPolicyCommand, PutBucketPolicyCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { s3, S3_BUCKET, assertPrivateStorage, privateObjectKey } from "../src/lib/s3";

// Default is inventory-only. Run with --apply during a maintenance window.
async function main() {
  const destination = await assertPrivateStorage();
  const apply = process.argv.includes("--apply");
  let count = 0;
  for (const prefix of ["applications/uploads/", "digests/"]) {
    let continuation: string | undefined;
    do {
      const page = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix, ContinuationToken: continuation }));
      for (const object of page.Contents ?? []) {
        if (!object.Key || object.Key.endsWith("/")) continue;
        count++;
        if (!apply) continue;
        // A successful CopyObject is atomic. Do not overwrite newer destination
        // files on reruns; source ETag metadata binds the copy to the source.
        let copied = false;
        try {
          const head = await s3.send(new HeadObjectCommand({ Bucket: destination, Key: object.Key }));
          copied = head.Metadata?.["migration-source-etag"] === object.ETag && head.ContentLength === object.Size;
        } catch (error) {
          if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode !== 404) throw error;
        }
        if (!copied) {
          const source = await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: object.Key }));
          await s3.send(new CopyObjectCommand({ Bucket: destination, Key: object.Key,
            CopySource: `${S3_BUCKET}/${object.Key.split("/").map(encodeURIComponent).join("/")}`,
            CopySourceIfMatch: object.ETag, MetadataDirective: "REPLACE",
            Metadata: { "migration-source-etag": object.ETag ?? "" },
            ContentType: source.ContentType, ContentDisposition: "attachment" }));
        }
        const verified = await s3.send(new HeadObjectCommand({ Bucket: destination, Key: object.Key }));
        if (verified.ContentLength !== object.Size || verified.Metadata?.["migration-source-etag"] !== object.ETag) throw new Error("Copy verification failed");
        const unsigned = await fetch(`https://${destination}.s3.${process.env.AWS_REGION}.amazonaws.com/${object.Key.split("/").map(encodeURIComponent).join("/")}`, { method: "HEAD", redirect: "error" });
        if (unsigned.status !== 403) throw new Error("Private object did not deny unsigned access");
      }
      continuation = page.NextContinuationToken;
    } while (continuation);
  }
  console.log(`${apply ? "Copied and verified" : "Would migrate"} ${count} private objects`);
  if (!apply) return;

  // Preserve existing marketing policy statements, but explicitly revoke every
  // old private link (including versioned URLs). No object deletion is needed.
  let policy: { Version: string; Statement: { Sid?: string; [key: string]: unknown }[] } = { Version: "2012-10-17", Statement: [] };
  try {
    const result = await s3.send(new GetBucketPolicyCommand({ Bucket: S3_BUCKET }));
    policy = JSON.parse(result.Policy!);
  } catch (error) {
    if ((error as { name: string }).name !== "NoSuchBucketPolicy") throw error;
  }
  policy.Statement = policy.Statement.filter(statement => statement.Sid !== "DenyLegacyPrivateFiles");
  policy.Statement.push({ Sid: "DenyLegacyPrivateFiles", Effect: "Deny", Principal: "*",
    Action: ["s3:GetObject", "s3:GetObjectVersion"],
    Resource: [`arn:aws:s3:::${S3_BUCKET}/applications/uploads/*`, `arn:aws:s3:::${S3_BUCKET}/digests/*`] });
  await s3.send(new PutBucketPolicyCommand({ Bucket: S3_BUCKET, Policy: JSON.stringify(policy) }));

  for (const doc of await prisma.document.findMany()) {
    const key = privateObjectKey(doc.url);
    if (key !== doc.url) await prisma.document.update({ where: { id: doc.id }, data: { url: key } });
  }
  for (const app of await prisma.application.findMany({ select: { id: true, personal: true } })) {
    const personal = app.personal as Record<string, Prisma.InputJsonValue>;
    if (typeof personal.headshotUrl === "string" && personal.headshotUrl) {
      await prisma.application.update({ where: { id: app.id }, data: { personal: { ...personal, headshotUrl: privateObjectKey(personal.headshotUrl) } } });
    }
  }
  for (const delivery of await prisma.digestDelivery.findMany({ where: { pdfUrl: { not: null } } })) {
    await prisma.digestDelivery.update({ where: { id: delivery.id }, data: { pdfUrl: privateObjectKey(delivery.pdfUrl!) } });
  }
  console.log("Legacy private reads denied and database URLs normalized.");
}
main().finally(() => prisma.$disconnect()).catch(error => { console.error(error); process.exitCode = 1; });
