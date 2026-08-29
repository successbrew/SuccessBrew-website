import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { resourceFields } from "@/lib/admin/schemas/resource";
import { updateResource } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Resource</h1>
      <ContentForm
        fields={resourceFields}
        defaultValues={resource}
        action={updateResource.bind(null, resource.id)}
        redirectTo="/sbh-1111/resources"
      />
    </div>
  );
}
