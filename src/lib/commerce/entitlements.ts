import { prisma } from "@/lib/prisma";

/** Authoritative paid-access check: never derive access from a UI flag — always
 * query the verified Entitlement row (granted only by a verified payment webhook). */
export async function hasActiveEntitlement(email: string, productKey: string): Promise<boolean> {
  const entitlement = await prisma.entitlement.findUnique({
    where: {
      customerEmail_productKey: {
        customerEmail: email.trim().toLowerCase(),
        productKey,
      },
    },
  });

  if (!entitlement || entitlement.status !== "ACTIVE") return false;
  if (entitlement.expiresAt && entitlement.expiresAt < new Date()) return false;

  return true;
}
