import { createHash } from "crypto";
import { renderToBuffer } from "@react-pdf/renderer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { s3, S3_BUCKET, publicUrlForKey } from "@/lib/s3";
import { generateTopicBrief, AnthropicNotConfiguredError } from "./anthropic";
import { DigestPdfDocument, type DigestTopicSection } from "./DigestPdfDocument";
import { sendDailyDigestEmail } from "@/lib/services/email/notify-digest";
import { COMMUNITY_GROWTH_PRODUCT, COMMUNITY_FOUNDER_PRODUCT } from "@/lib/commerce/product";

/** Midnight UTC for "today" — the shared key every model in this feature uses
 * for daily idempotency (one brief per topic per day, one delivery per member
 * per day). */
function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

const COMMUNITY_PRODUCT_KEYS = [COMMUNITY_GROWTH_PRODUCT.key, COMMUNITY_FOUNDER_PRODUCT.key];

async function ensureTodaysTopicBriefs(date: Date): Promise<{ generated: number; failed: number }> {
  const topics = await prisma.digestTopic.findMany({ where: { isActive: true } });
  let generated = 0;
  let failed = 0;

  for (const topic of topics) {
    const existing = await prisma.digestTopicBrief.findUnique({
      where: { topicId_date: { topicId: topic.id, date } },
    });
    if (existing) continue;

    try {
      const content = await generateTopicBrief(topic.title);
      await prisma.digestTopicBrief.create({
        data: { topicId: topic.id, date, content },
      });
      generated += 1;
    } catch (err) {
      failed += 1;
      // A missing API key should stop the whole run early (nothing will
      // succeed) rather than silently "failing" every topic one by one.
      if (err instanceof AnthropicNotConfiguredError) throw err;
      console.error(`daily-digest: failed to generate brief for topic "${topic.title}"`, err);
    }
  }

  return { generated, failed };
}

async function renderAndUploadPdf(params: {
  email: string;
  dateLabel: string;
  sections: DigestTopicSection[];
  dateKey: string;
}): Promise<string> {
  const buffer = await renderToBuffer(
    DigestPdfDocument({ memberEmail: params.email, dateLabel: params.dateLabel, sections: params.sections })
  );

  const emailHash = createHash("sha256").update(params.email).digest("hex").slice(0, 16);
  const key = `digests/${params.dateKey}/${emailHash}.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
      ContentLength: buffer.byteLength,
    })
  );

  return publicUrlForKey(key);
}

export interface RunDailyDigestResult {
  topicsGenerated: number;
  topicsFailed: number;
  sent: number;
  failed: number;
  skippedNoTopics: number;
  skippedAlreadyDelivered: number;
}

/**
 * Full daily-digest pipeline: generate today's per-topic AI briefs (shared
 * across every member who follows that topic), then assemble + email each
 * eligible paid member their personal PDF. Idempotent throughout — safe to
 * re-run (cron retry, manual "send now") without duplicating AI calls,
 * uploads, or emails.
 */
export async function runDailyDigest(): Promise<RunDailyDigestResult> {
  const date = todayUtc();
  const dateKey = date.toISOString().slice(0, 10);
  const dateLabel = date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const { generated: topicsGenerated, failed: topicsFailed } = await ensureTodaysTopicBriefs(date);

  const entitlements = await prisma.entitlement.findMany({
    where: {
      productKey: { in: COMMUNITY_PRODUCT_KEYS },
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
  });
  const recipientEmails = [...new Set(entitlements.map((e) => e.customerEmail))];

  let sent = 0;
  let failed = 0;
  let skippedNoTopics = 0;
  let skippedAlreadyDelivered = 0;

  for (const email of recipientEmails) {
    const alreadyDelivered = await prisma.digestDelivery.findUnique({
      where: { customerEmail_date: { customerEmail: email, date } },
    });
    if (alreadyDelivered) {
      skippedAlreadyDelivered += 1;
      continue;
    }

    const selections = await prisma.digestTopicSelection.findMany({
      where: { customerEmail: email },
      include: { topic: true },
    });

    if (selections.length === 0) {
      skippedNoTopics += 1;
      await prisma.digestDelivery.create({
        data: { customerEmail: email, date, status: "SKIPPED_NO_TOPICS" },
      });
      continue;
    }

    try {
      const briefs = await prisma.digestTopicBrief.findMany({
        where: { date, topicId: { in: selections.map((s) => s.topicId) } },
      });
      const briefByTopicId = new Map(briefs.map((b) => [b.topicId, b.content]));

      const sections: DigestTopicSection[] = selections
        .filter((s) => s.topic.isActive)
        .map((s) => ({ title: s.topic.title, content: briefByTopicId.get(s.topicId) ?? null }));

      const pdfUrl = await renderAndUploadPdf({ email, dateLabel, sections, dateKey });

      await sendDailyDigestEmail({
        email,
        dateLabel,
        topicTitles: sections.map((s) => s.title),
        pdfUrl,
      });

      await prisma.digestDelivery.create({
        data: { customerEmail: email, date, status: "SENT", pdfUrl },
      });
      sent += 1;
    } catch (err) {
      failed += 1;
      const error = err instanceof Error ? err.message : String(err);
      console.error(`daily-digest: failed to deliver to ${email}`, err);
      await prisma.digestDelivery.create({
        data: { customerEmail: email, date, status: "FAILED", error },
      });
    }
  }

  return { topicsGenerated, topicsFailed, sent, failed, skippedNoTopics, skippedAlreadyDelivered };
}
