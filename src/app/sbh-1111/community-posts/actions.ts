"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { communityPostSchema } from "@/lib/admin/schemas/community-post";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/community-posts", "/community"];

export async function createCommunityPost(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  return runCreate(prisma.communityPost, communityPostSchema, formDataToObject(formData), REVALIDATE);
}

export async function updateCommunityPost(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  return runUpdate(prisma.communityPost, communityPostSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deleteCommunityPost(formData: FormData) {
  await requirePermission(PERMISSIONS.COMMUNITY_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.communityPost, id, REVALIDATE);
}
