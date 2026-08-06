import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { communityPostFields } from "@/lib/admin/schemas/community-post";
import { createCommunityPost } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCommunityPostPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Community Post</h1>
      <ContentForm
        fields={communityPostFields}
        defaultValues={{
          order: 0,
          name: "",
          role: "",
          initial: "",
          avatarStyle: "BLUE",
          tag: "",
          tagStyle: "LIME",
          content: "",
          likes: 0,
          comments: 0,
          timeAgo: "1d ago",
        }}
        action={createCommunityPost}
        redirectTo="/sbh-1111/community-posts"
      />
    </div>
  );
}
