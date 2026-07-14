"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { communityPostSchema } from "@/lib/admin/schemas/community-post";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/admin/community-posts", "/community"];

export async function createCommunityPost(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.communityPost, communityPostSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCommunityPost(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.communityPost, communityPostSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteCommunityPost(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.communityPost, id, REVALIDATE);
}
