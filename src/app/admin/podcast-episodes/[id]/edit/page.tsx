import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { podcastEpisodeFields } from "@/lib/admin/schemas/podcast-episode";
import { updatePodcastEpisode } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPodcastEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const podcastEpisode = await prisma.podcastEpisode.findUnique({ where: { id } });
  if (!podcastEpisode) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Podcast Episode</h1>
      <ContentForm
        fields={podcastEpisodeFields}
        defaultValues={{
          ...podcastEpisode,
          thumbnailUrl: podcastEpisode.thumbnailUrl ?? undefined,
          listenUrl: podcastEpisode.listenUrl ?? undefined,
        }}
        action={updatePodcastEpisode.bind(null, podcastEpisode.id)}
        redirectTo="/admin/podcast-episodes"
      />
    </div>
  );
}
