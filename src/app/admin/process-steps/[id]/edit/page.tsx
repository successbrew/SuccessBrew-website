import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { processStepFields } from "@/lib/admin/schemas/process-step";
import { updateProcessStep } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProcessStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const processStep = await prisma.processStep.findUnique({ where: { id } });
  if (!processStep) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Process Step</h1>
      <ContentForm
        fields={processStepFields}
        defaultValues={processStep}
        action={updateProcessStep.bind(null, processStep.id)}
        redirectTo="/admin/process-steps"
      />
    </div>
  );
}
