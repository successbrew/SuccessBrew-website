import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { digestTopicFields } from "@/lib/admin/schemas/digest-topic";
import { createDigestTopic } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewDigestTopicPage() {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Digest Topic</h1>
      <ContentForm
        fields={digestTopicFields}
        defaultValues={{ title: "", slug: "", isActive: true, order: 0 }}
        action={createDigestTopic}
        redirectTo="/sbh-1111/digest-topics"
      />
    </div>
  );
}
