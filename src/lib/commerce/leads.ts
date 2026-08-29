import { prisma } from "@/lib/prisma";
import type { LeadStatus } from "@prisma/client";
import { upsertBrevoContact, BrevoNotConfiguredError } from "./brevo";

/** Creates or updates a Lead by email, then attempts a best-effort Brevo sync.
 * Brevo failures (including "not configured yet") never throw out of here —
 * they're recorded on BrevoSync for later retry. */
export async function upsertLead(params: {
  email: string;
  name?: string | null;
  userId?: string | null;
  source?: string;
  leadMagnet?: string | null;
  status?: LeadStatus;
}) {
  const email = params.email.trim().toLowerCase();

  const lead = await prisma.lead.upsert({
    where: { email },
    create: {
      email,
      name: params.name ?? undefined,
      userId: params.userId ?? undefined,
      source: params.source ?? "website",
      leadMagnet: params.leadMagnet ?? undefined,
      status: params.status ?? "LEAD",
    },
    update: {
      ...(params.name ? { name: params.name } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.status ? { status: params.status } : {}),
    },
  });

  await syncLeadToBrevo(lead.id).catch(() => {});

  return lead;
}

/** Best-effort Brevo sync for a lead. Safe to call repeatedly (e.g. from a future
 * retry job) — always leaves BrevoSync in a consistent PENDING/SYNCED/FAILED state. */
export async function syncLeadToBrevo(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  await prisma.brevoSync.upsert({
    where: { leadId },
    create: { leadId, syncStatus: "PENDING" },
    update: {},
  });

  try {
    const contact = await upsertBrevoContact(lead.email, {
      FIRSTNAME: lead.name ?? undefined,
      LEAD_STATUS: lead.status,
      LEAD_SOURCE: lead.source,
    });

    await prisma.brevoSync.update({
      where: { leadId },
      data: {
        brevoContactId: String(contact.id),
        syncStatus: "SYNCED",
        lastSyncedAt: new Date(),
        lastAttemptAt: new Date(),
        lastError: null,
      },
    });
  } catch (err) {
    const notConfigured = err instanceof BrevoNotConfiguredError;
    await prisma.brevoSync.update({
      where: { leadId },
      data: {
        syncStatus: notConfigured ? "PENDING" : "FAILED",
        lastAttemptAt: new Date(),
        lastError: notConfigured ? null : err instanceof Error ? err.message : String(err),
        ...(notConfigured ? {} : { retryCount: { increment: 1 } }),
      },
    });
  }
}
