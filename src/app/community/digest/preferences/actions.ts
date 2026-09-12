"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { hasActiveEntitlement } from "@/lib/commerce/entitlements";
import { COMMUNITY_GROWTH_PRODUCT, COMMUNITY_FOUNDER_PRODUCT } from "@/lib/commerce/product";
import { signPreferencesToken, verifyPreferencesToken } from "@/lib/digest/preferences-token";
import { sendEmail } from "@/lib/services/email/send";

type ActionResult = { success: true } | { error: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

async function isPaidCommunityMember(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  return (
    (await hasActiveEntitlement(normalized, COMMUNITY_GROWTH_PRODUCT.key)) ||
    (await hasActiveEntitlement(normalized, COMMUNITY_FOUNDER_PRODUCT.key))
  );
}

/**
 * Step 1 of the flow. Never returns membership data or a usable token
 * directly to the caller — that would still let anyone who knows an email
 * read/write someone else's preferences (the original bug). Instead, if the
 * email has an active membership, emails a short-lived signed link to that
 * address; only whoever controls the inbox can follow it. Always returns the
 * same generic success response so this can't be used to probe which emails
 * are paying members.
 */
export async function requestPreferencesLink(email: string): Promise<ActionResult> {
  const ip = await clientIpFromHeaders();
  if (!(await checkRateLimit(`digest-prefs-request:${ip}`, 5, 10 * 60 * 1000))) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return { error: "Enter a valid email address." };

  if (await isPaidCommunityMember(normalized)) {
    const { token } = signPreferencesToken(normalized);
    const url = `${SITE_URL}/community/digest/preferences?email=${encodeURIComponent(normalized)}&token=${token}`;
    await sendEmail({
      to: normalized,
      subject: "Manage your daily brief topics",
      html: `<p>Use the link below to choose the topics covered in your daily brief. This link expires in 30 minutes.</p><p><a href="${url}">${url}</a></p>`,
      template: "digest-preferences-link",
    });
  }

  return { success: true };
}

export async function getMemberTopicSelections(
  email: string,
  token: string
): Promise<{ eligible: boolean; selectedTopicIds: string[] }> {
  const ip = await clientIpFromHeaders();
  if (!(await checkRateLimit(`digest-prefs-load:${ip}`, 20, 10 * 60 * 1000))) {
    return { eligible: false, selectedTopicIds: [] };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return { eligible: false, selectedTopicIds: [] };
  if (!verifyPreferencesToken(normalized, token)) return { eligible: false, selectedTopicIds: [] };

  const eligible = await isPaidCommunityMember(normalized);
  if (!eligible) return { eligible: false, selectedTopicIds: [] };

  const selections = await prisma.digestTopicSelection.findMany({
    where: { customerEmail: normalized },
    select: { topicId: true },
  });

  return { eligible: true, selectedTopicIds: selections.map((s) => s.topicId) };
}

export async function saveTopicSelections(email: string, token: string, topicIds: string[]): Promise<ActionResult> {
  const ip = await clientIpFromHeaders();
  if (!(await checkRateLimit(`digest-prefs-save:${ip}`, 10, 10 * 60 * 1000))) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return { error: "Enter a valid email address." };
  if (!verifyPreferencesToken(normalized, token)) {
    return { error: "Your link has expired. Request a new one from the preferences page." };
  }

  const eligible = await isPaidCommunityMember(normalized);
  if (!eligible) {
    return { error: "We couldn't find an active paid membership for this email." };
  }

  const validTopics = await prisma.digestTopic.findMany({
    where: { id: { in: topicIds }, isActive: true },
    select: { id: true },
  });
  const validIds = new Set(validTopics.map((t) => t.id));

  await prisma.$transaction(async (tx) => {
    await tx.digestTopicSelection.deleteMany({ where: { customerEmail: normalized } });
    if (validIds.size > 0) {
      await tx.digestTopicSelection.createMany({
        data: [...validIds].map((topicId) => ({ customerEmail: normalized, topicId })),
      });
    }
  });

  return { success: true };
}
