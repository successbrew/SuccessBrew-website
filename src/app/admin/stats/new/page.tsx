import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { statFields } from "@/lib/admin/schemas/stat";
import { createStat } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewStatPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Stat</h1>
      <ContentForm
        fields={statFields}
        defaultValues={{ order: 0, number: "", label: "", colorScheme: "DEFAULT" }}
        action={createStat}
        redirectTo="/admin/stats"
      />
    </div>
  );
}
