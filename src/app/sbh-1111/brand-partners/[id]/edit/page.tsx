import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { brandPartnerFields } from "@/lib/admin/schemas/brand-partner";
import { updateBrandPartner } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditBrandPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const brandPartner = await prisma.brandPartner.findUnique({ where: { id } });
  if (!brandPartner) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Brand Partner</h1>
      <ContentForm
        fields={brandPartnerFields}
        defaultValues={{
          ...brandPartner,
          websiteUrl: brandPartner.websiteUrl ?? undefined,
        }}
        action={updateBrandPartner.bind(null, brandPartner.id)}
        redirectTo="/sbh-1111/brand-partners"
      />
    </div>
  );
}
