# Security remediation rollout

These repository changes require infrastructure configuration before deployment.
Do not deploy with private storage or document scanning unconfigured: uploads and
private downloads deliberately fail closed. Existing local changes under `tmp/`
are unrelated to this work.

## Storage

1. Deploy `infra/private-storage.yaml` in the application's AWS region. Set
   `AWS_S3_PRIVATE_BUCKET_NAME` to the output bucket. Keep `AWS_S3_BUCKET_NAME`
   for public marketing assets. Give the application IAM role only the required
   private `GetObject`, `PutObject`, and `GetBucketPublicAccessBlock` permissions.
   No public/CDN principal may read this bucket. Review access points as well.
2. Use maintenance mode to pause application uploads and digest generation during
   migration. Back up the database and existing public bucket policy.
3. With the production environment explicitly loaded, run
   `npx tsx scripts/migrate-private-storage.ts` for inventory. Review the count,
   then run the same command with `--apply` using a migration principal with
   source list/read, destination write/read and source bucket policy permissions.
   The script copies all private prefixes, verifies copies and unsigned 403s,
   adds a deny rule for old private prefixes, and normalizes database URLs.
   It does not delete objects or replace unrelated public policy statements.
4. Invalidate any cached private objects at existing CDNs. Verify both a known
   old URL and its new unsigned URL return 403, while an authorized admin can
   download the file. Verify public marketing images still work. External or
   nonstandard historical URLs are rejected and require manual migration.
5. Resume traffic with the new application. Default admin downloads expire after
   15 minutes; recipient-specific digest email links retain their seven-day limit.
   AWS object URLs are isolated from the app origin and use attachment disposition.

AWS reference: https://docs.aws.amazon.com/AmazonS3/latest/userguide/configuring-block-public-access-bucket.html

## Upload scanning

Set `DOCUMENT_SCAN_URL` to a trusted HTTPS malware scanning service and
`DOCUMENT_SCAN_TOKEN` to its secret. The endpoint receives raw PDF bytes with
Bearer authentication and must return JSON `{ "clean": true, "sha256": "..." }`
only after scanning the entire document. The hash must match the received bytes.
Configure the scanner to reject active content, embedded executables, encrypted
or otherwise unscannable PDFs. No fallback verdict is accepted. Files remain
quarantined in server memory until validation completes. Images are decoded and
re-encoded; SVG is rejected. Audit existing documents separately, since migrating
stored files does not retroactively scan them.

Admin uploads now use the server endpoint instead of presigned PUTs. Confirm the
hosting platform body-size limit (Vercel functions may reject uploads below this
app's 10 MB maximum); increase supported ingress capacity or advertise a smaller
limit if necessary. Configure edge body limits and rate limits for `/api/apply/upload`,
`/api/admin/upload`, `/api/checkout`, and application submission POSTs.

## Payments and database

Run `npm run db:migrate:deploy` before the new code. It adds refund records and
payment event lease fields; legacy processing rows with no lease can be reclaimed.
The processing lease lasts five minutes. Active duplicates return 503 to preserve
provider retries. Settlement checks provider order, payment identity, amount,
currency and captured state before granting access. Serializable transactions
protect concurrent fulfillment/refunds; serialization conflicts remain retryable.

Partial refunds retain access until cumulative processed refunds equal the paid
amount. Full refunds revoke only when no qualifying paid purchase remains. Refund
IDs deduplicate deliveries. This is the implemented business policy.

Set `CRON_SECRET` and Razorpay credentials. The
`/api/cron/reconcile-payments` job rotates through 25 pending/failed/paid orders
per run, fetching provider payments and processed refunds. Vercel Hobby only
allows daily crons, so `vercel.json` runs it once a day as a backstop; the
ten-minute cadence comes from an external scheduler (cron-job.org) calling the
same URL with `Authorization: Bearer $CRON_SECRET`. Increase throughput as the order volume grows;
monitor reconciliation errors and failed payment event records. It makes no
capture, refund, or charge requests. Investigate historical incorrect revocations
separately; automatically reopening previously refunded local orders is unsafe.

Razorpay reference: https://razorpay.com/docs/api/payments/

## Rate limits and CSP

Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Production refuses
sensitive requests when storage is missing, errors, or times out. Alert on
`SECURITY:` log events. Development alone may use local counters.
Vercel uses its overwritten `x-vercel-forwarded-for` header. Other ingress
providers must strip and replace an IP header, then configure its name as
`TRUSTED_CLIENT_IP_HEADER`. With no trusted ingress configuration all clients
share an `unknown` bucket, rather than accepting spoofed IPs.

Page responses use fresh script nonces and dynamic rendering. This trades static
page caching for strict script policy. Styles still allow inline declarations for
existing UI libraries. Test both hosts, sign-in, admin forms, and Razorpay test-mode
checkout in a browser before production rollout. Do not cache nonce-bearing HTML
at a CDN. Payment completion must continue to depend on verified provider events.
