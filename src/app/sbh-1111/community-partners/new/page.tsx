import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { brandPartnerFields } from "@/lib/admin/schemas/brand-partner";
import { createCommunityPartner } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCommunityPartnerPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Community Partner</h1>
      <ContentForm
        fields={brandPartnerFields}
        defaultValues={{ order: 0, name: "", logoUrl: "", websiteUrl: "", group: "COMMUNITY_PARTNER" }}
        action={createCommunityPartner}
        redirectTo="/sbh-1111/community-partners"
      />
    </div>
  );
}
