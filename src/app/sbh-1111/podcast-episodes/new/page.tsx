import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { podcastEpisodeFieldsWithSpeaker } from "@/lib/admin/schemas/podcast-episode";
import { createPodcastEpisode } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPodcastEpisodePage() {
  await verifyAdminSession();
  const speakers = await prisma.speaker.findMany({ orderBy: { displayName: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Podcast Episode</h1>
      <ContentForm
        fields={podcastEpisodeFieldsWithSpeaker(speakers.map((s) => ({ value: s.id, label: s.displayName })))}
        defaultValues={{
          order: 0,
          isFeatured: false,
          episodeNumber: "",
          duration: "",
          guest: "",
          title: "",
          thumbnailUrl: "",
          listenUrl: "",
          speakerId: "__none__",
        }}
        action={createPodcastEpisode}
        redirectTo="/sbh-1111/podcast-episodes"
      />
    </div>
  );
}
