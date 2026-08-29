"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { hasActiveEntitlement } from "@/lib/commerce/entitlements";
import { COMMUNITY_GROWTH_PRODUCT, COMMUNITY_FOUNDER_PRODUCT } from "@/lib/commerce/product";

type ActionResult = { success: true } | { error: string };

async function isPaidCommunityMember(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  return (
    (await hasActiveEntitlement(normalized, COMMUNITY_GROWTH_PRODUCT.key)) ||
    (await hasActiveEntitlement(normalized, COMMUNITY_FOUNDER_PRODUCT.key))
  );
}

export async function getMemberTopicSelections(
  email: string
): Promise<{ eligible: boolean; selectedTopicIds: string[] }> {
  const ip = await clientIpFromHeaders();
  if (!(await checkRateLimit(`digest-prefs-load:${ip}`, 20, 10 * 60 * 1000))) {
    return { eligible: false, selectedTopicIds: [] };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return { eligible: false, selectedTopicIds: [] };

  const eligible = await isPaidCommunityMember(normalized);
  if (!eligible) return { eligible: false, selectedTopicIds: [] };

  const selections = await prisma.digestTopicSelection.findMany({
    where: { customerEmail: normalized },
    select: { topicId: true },
  });

  return { eligible: true, selectedTopicIds: selections.map((s) => s.topicId) };
}

export async function saveTopicSelections(email: string, topicIds: string[]): Promise<ActionResult> {
  const ip = await clientIpFromHeaders();
  if (!(await checkRateLimit(`digest-prefs-save:${ip}`, 10, 10 * 60 * 1000))) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return { error: "Enter a valid email address." };

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
