import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { podcastEpisodeFields } from "@/lib/admin/schemas/podcast-episode";
import { createPodcastEpisode } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPodcastEpisodePage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Podcast Episode</h1>
      <ContentForm
        fields={podcastEpisodeFields}
        defaultValues={{
          order: 0,
          isFeatured: false,
          episodeNumber: "",
          duration: "",
          guest: "",
          title: "",
          thumbnailUrl: "",
          listenUrl: "",
        }}
        action={createPodcastEpisode}
        redirectTo="/admin/podcast-episodes"
      />
    </div>
  );
}
