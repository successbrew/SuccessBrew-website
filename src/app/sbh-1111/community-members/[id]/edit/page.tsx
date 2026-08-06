import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { brandPartnerFields } from "@/lib/admin/schemas/brand-partner";
import { updateCommunityMember } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCommunityMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const communityMember = await prisma.brandPartner.findUnique({ where: { id } });
  if (!communityMember) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Community Member</h1>
      <ContentForm
        fields={brandPartnerFields}
        defaultValues={{
          ...communityMember,
          websiteUrl: communityMember.websiteUrl ?? undefined,
        }}
        action={updateCommunityMember.bind(null, communityMember.id)}
        redirectTo="/sbh-1111/community-members"
      />
    </div>
  );
}
