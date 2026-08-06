import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** System-wide security/compliance trail — auth events, permission changes, deletes. */
export async function logAudit(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
  ip?: string;
}) {
  await prisma.auditLog.create({ data: params });
}

/** User-facing "what happened to this application" timeline entry. */
export async function logActivity(params: {
  applicationId?: string;
  actorId: string;
  action: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.activityLog.create({ data: params });
}
