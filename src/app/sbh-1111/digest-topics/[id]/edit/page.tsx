import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { digestTopicFields } from "@/lib/admin/schemas/digest-topic";
import { updateDigestTopic } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditDigestTopicPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  const { id } = await params;
  const topic = await prisma.digestTopic.findUnique({ where: { id } });
  if (!topic) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Digest Topic</h1>
      <ContentForm
        fields={digestTopicFields}
        defaultValues={topic}
        action={updateDigestTopic.bind(null, topic.id)}
        redirectTo="/sbh-1111/digest-topics"
      />
    </div>
  );
}
