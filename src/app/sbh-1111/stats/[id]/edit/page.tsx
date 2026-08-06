import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { statFields } from "@/lib/admin/schemas/stat";
import { updateStat } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditStatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const stat = await prisma.stat.findUnique({ where: { id } });
  if (!stat) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Stat</h1>
      <ContentForm
        fields={statFields}
        defaultValues={stat}
        action={updateStat.bind(null, stat.id)}
        redirectTo="/sbh-1111/stats"
      />
    </div>
  );
}
