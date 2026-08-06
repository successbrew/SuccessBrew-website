import { prisma } from "@/lib/prisma";

/** Broadcast notification visible to every admin with review access (see /sbh-1111 bell icon). */
export async function notifyAdmins(params: { type: string; title: string; message: string; link?: string }) {
  await prisma.notification.create({
    data: {
      audience: "ADMIN",
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });
}

/** Applicant-facing in-app notification, keyed by their Neon Auth user id. */
export async function notifyApplicant(params: {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  await prisma.notification.create({
    data: {
      audience: "APPLICANT",
      recipientId: params.recipientId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });
}
