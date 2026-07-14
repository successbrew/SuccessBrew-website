import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { serviceFields } from "@/lib/admin/schemas/service";
import { updateService } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Service</h1>
      <ContentForm
        fields={serviceFields}
        defaultValues={service}
        action={updateService.bind(null, service.id)}
        redirectTo="/admin/services"
      />
    </div>
  );
}
