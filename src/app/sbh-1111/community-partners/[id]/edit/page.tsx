import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { brandPartnerFields } from "@/lib/admin/schemas/brand-partner";
import { updateCommunityPartner } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCommunityPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const communityPartner = await prisma.brandPartner.findUnique({ where: { id } });
  if (!communityPartner) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Community Partner</h1>
      <ContentForm
        fields={brandPartnerFields}
        defaultValues={{
          ...communityPartner,
          websiteUrl: communityPartner.websiteUrl ?? undefined,
        }}
        action={updateCommunityPartner.bind(null, communityPartner.id)}
        redirectTo="/sbh-1111/community-partners"
      />
    </div>
  );
}
