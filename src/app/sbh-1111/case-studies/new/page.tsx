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
          clientName: "",
          description: "",
          imageUrl: "",
          problem: "",
          strategy: "",
          solutionContent: "",
          results: "",
          reverseLayout: false,
          showOnHomepage: false,
        }}
        action={createCaseStudy}
        redirectTo="/sbh-1111/case-studies"
      />

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 text-sm">
        <h3 className="font-semibold text-blue-900 mb-3">Advanced Features</h3>
        <p className="text-blue-800 mb-4">
          The case study page now supports rich sections like hero metrics, strategy steps, result metrics, and timelines.
          These are currently available through database updates. An enhanced admin UI is planned for future releases.
        </p>
        <details className="text-blue-800 text-xs">
          <summary className="cursor-pointer font-semibold mb-2">View JSON Field Formats</summary>
          <div className="mt-3 space-y-2 font-mono bg-white p-3 rounded border border-blue-200">
            <div>
              <strong>heroMetrics:</strong>
              <pre className="text-xs overflow-x-auto">{`[{"metric":"growth","value":"535%","label":"Reach Growth"}]`}</pre>
            </div>
            <div>
              <strong>strategySteps:</strong>
              <pre className="text-xs overflow-x-auto">{`[{"title":"Step 1","description":"..."}]`}</pre>
            </div>
            <div>
              <strong>resultMetrics:</strong>
              <pre className="text-xs overflow-x-auto">{`[{"value":"535%","label":"Reach Growth"}]`}</pre>
            </div>
            <div>
              <strong>beforeAfter:</strong>
              <pre className="text-xs overflow-x-auto">{`{"before":"Before text","after":"After text"}`}</pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
