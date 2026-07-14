import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { processStepFields } from "@/lib/admin/schemas/process-step";
import { createProcessStep } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProcessStepPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Process Step</h1>
      <ContentForm
        fields={processStepFields}
        defaultValues={{ order: 0, stepNumber: "", title: "", description: "" }}
        action={createProcessStep}
        redirectTo="/admin/process-steps"
      />
    </div>
  );
}
