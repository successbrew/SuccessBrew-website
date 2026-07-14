"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { siteSettingsSchema } from "@/lib/admin/schemas/site-settings";
import { formDataToObject } from "@/lib/admin/form-data";
import type { ActionResult } from "@/lib/admin/crud";

export async function updateSiteSettings(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();

  const parsed = siteSettingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  });

  ["/admin/settings", "/", "/community", "/case-studies", "/testimonials"].forEach((p) => revalidatePath(p));
  return { success: true };
}
