"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";

export async function markNotificationRead(id: string) {
  await verifyAdminSession();
  await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  revalidatePath("/sbh-1111", "layout");
}

export async function markAllNotificationsRead() {
  await verifyAdminSession();
  await prisma.notification.updateMany({
    where: { audience: "ADMIN", readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/sbh-1111", "layout");
}
