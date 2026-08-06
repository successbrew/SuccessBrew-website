import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { caseStudyFields } from "@/lib/admin/schemas/case-study";
import { updateCaseStudy } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const caseStudy = await prisma.caseStudy.findUnique({ where: { id } });
  if (!caseStudy) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Case Study</h1>
      <ContentForm
        fields={caseStudyFields}
        defaultValues={caseStudy}
        action={updateCaseStudy.bind(null, caseStudy.id)}
        redirectTo="/sbh-1111/case-studies"
      />
    </div>
  );
}
