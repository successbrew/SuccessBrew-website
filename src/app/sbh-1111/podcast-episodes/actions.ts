"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { podcastEpisodeSchema } from "@/lib/admin/schemas/podcast-episode";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/sbh-1111/podcast-episodes", "/community", "/community/podcast"];

export async function createPodcastEpisode(formData: FormData) {
  await requirePermission(PERMISSIONS.PODCASTS_MANAGE);
  return runCreate(prisma.podcastEpisode, podcastEpisodeSchema, formDataToObject(formData), REVALIDATE);
}

export async function updatePodcastEpisode(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.PODCASTS_MANAGE);
  return runUpdate(prisma.podcastEpisode, podcastEpisodeSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deletePodcastEpisode(formData: FormData) {
  await requirePermission(PERMISSIONS.PODCASTS_MANAGE);
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.podcastEpisode, id, REVALIDATE);
}
