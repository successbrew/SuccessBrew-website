import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { podcastEpisodeColumns } from "@/lib/admin/schemas/podcast-episode";
import { deletePodcastEpisode } from "./actions";

export const dynamic = "force-dynamic";

export default async function PodcastEpisodesListPage() {
  await verifyAdminSession();
  const podcastEpisodes = await prisma.podcastEpisode.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Podcast Episodes</h1>
        <Button asChild>
          <Link href="/sbh-1111/podcast-episodes/new">New Podcast Episode</Link>
        </Button>
      </div>
      <DataTable
        rows={podcastEpisodes}
        columns={podcastEpisodeColumns}
        editHrefBase="/sbh-1111/podcast-episodes"
        deleteAction={deletePodcastEpisode}
      />
    </div>
  );
}
