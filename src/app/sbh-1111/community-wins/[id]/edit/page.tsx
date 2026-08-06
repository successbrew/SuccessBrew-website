import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { communityWinFields } from "@/lib/admin/schemas/community-win";
import { updateCommunityWin } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCommunityWinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const communityWin = await prisma.communityWin.findUnique({ where: { id } });
  if (!communityWin) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Community Win</h1>
      <ContentForm
        fields={communityWinFields}
        defaultValues={{
          ...communityWin,
          avatarStyle: communityWin.avatarStyle as "BLUE" | "LIME",
        }}
        action={updateCommunityWin.bind(null, communityWin.id)}
        redirectTo="/sbh-1111/community-wins"
      />
    </div>
  );
}
