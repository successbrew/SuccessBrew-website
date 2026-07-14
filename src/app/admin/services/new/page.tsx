import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { serviceFields } from "@/lib/admin/schemas/service";
import { createService } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Service</h1>
      <ContentForm
        fields={serviceFields}
        defaultValues={{ order: 0, num: "", title: "", description: "", tags: [] }}
        action={createService}
        redirectTo="/admin/services"
      />
    </div>
  );
}
