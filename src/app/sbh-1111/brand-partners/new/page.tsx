import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { brandPartnerFields } from "@/lib/admin/schemas/brand-partner";
import { createBrandPartner } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewBrandPartnerPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Brand Partner</h1>
      <ContentForm
        fields={brandPartnerFields}
        defaultValues={{ order: 0, name: "", logoUrl: "", websiteUrl: "", group: "SERVICES_HOMEPAGE" }}
        action={createBrandPartner}
        redirectTo="/sbh-1111/brand-partners"
      />
    </div>
  );
}
