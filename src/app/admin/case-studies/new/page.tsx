import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { caseStudyFields } from "@/lib/admin/schemas/case-study";
import { createCaseStudy } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCaseStudyPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Case Study</h1>
      <ContentForm
        fields={caseStudyFields}
        defaultValues={{
          order: 0,
          tag: "",
          title: "",
          imageUrl: "",
          problem: "",
          strategy: "",
          results: "",
          reverseLayout: false,
          showOnHomepage: false,
        }}
        action={createCaseStudy}
        redirectTo="/admin/case-studies"
      />
    </div>
  );
}
