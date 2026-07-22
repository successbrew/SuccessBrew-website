"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { runCreate, runUpdate, runDelete } from "@/lib/admin/crud";
import { podcastEpisodeSchema } from "@/lib/admin/schemas/podcast-episode";
import { formDataToObject } from "@/lib/admin/form-data";

const REVALIDATE = ["/admin/podcast-episodes", "/community", "/community/podcast"];

export async function createPodcastEpisode(formData: FormData) {
  await verifyAdminSession();
  return runCreate(prisma.podcastEpisode, podcastEpisodeSchema, formDataToObject(formData), REVALIDATE);
}

export async function updatePodcastEpisode(id: string, formData: FormData) {
  await verifyAdminSession();
  return runUpdate(prisma.podcastEpisode, podcastEpisodeSchema, id, formDataToObject(formData), REVALIDATE);
}

export async function deletePodcastEpisode(formData: FormData) {
  await verifyAdminSession();
  const id = String(formData.get("id") ?? "");
  return runDelete(prisma.podcastEpisode, id, REVALIDATE);
}
