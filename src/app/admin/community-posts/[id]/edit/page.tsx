import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { communityPostFields } from "@/lib/admin/schemas/community-post";
import { updateCommunityPost } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const communityPost = await prisma.communityPost.findUnique({ where: { id } });
  if (!communityPost) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Community Post</h1>
      <ContentForm
        fields={communityPostFields}
        defaultValues={{
          ...communityPost,
          avatarStyle: communityPost.avatarStyle as "BLUE" | "DARK",
        }}
        action={updateCommunityPost.bind(null, communityPost.id)}
        redirectTo="/admin/community-posts"
      />
    </div>
  );
}
