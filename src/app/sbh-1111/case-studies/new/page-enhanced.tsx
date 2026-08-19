// This is a future enhanced form component for case studies
// For now, use the standard ContentForm with basic fields
// This file documents the future structure for adding rich fields

import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { caseStudyFields } from "@/lib/admin/schemas/case-study";
import { createCaseStudy } from "../actions";

export const dynamic = "force-dynamic";

/**
 * Enhanced Case Study Form
 *
 * This component would include:
 * - Basic Information Section (title, client, description)
 * - Hero Metrics (repeatable: metric, value, label)
 * - Challenge Section (problem, optional image)
 * - Before/After Transformation
 * - Strategy Steps (repeatable: title, description)
 * - Solution Details (content, optional media)
 * - Result Metrics (repeatable: metric, value, label)
 * - Timeline Steps (repeatable: title, description, order)
 * - PDF Upload
 * - SEO Fields
 *
 * Implementation:
 * 1. Create CaseStudyAdminForm.tsx component with custom field inputs
 * 2. Use state management to handle repeatable fields
 * 3. Convert repeatable fields to JSON before submission
 * 4. Update actions.ts to handle JSON serialization
 */

export default async function NewCaseStudyPageEnhanced() {
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
          heroMetrics: [],
          strategySteps: [],
          resultMetrics: [],
          timelineSteps: [],
        }}
        action={createCaseStudy}
        redirectTo="/sbh-1111/case-studies"
      />

      <div className="mt-12 rounded-lg bg-blue-50 p-6 text-sm text-blue-900">
        <h2 className="font-bold mb-3">Advanced Fields (JSON)</h2>
        <p className="mb-3">
          The following fields accept JSON data and can be added via direct database updates:
        </p>
        <ul className="space-y-3">
          <li>
            <code className="text-xs bg-white px-2 py-1 rounded">heroMetrics</code> - Primary result metric displayed in hero
            <pre className="text-xs bg-white p-2 mt-1 overflow-x-auto">{`[{"metric":"growth","value":"535%","label":"Reach Growth"}]`}</pre>
          </li>
          <li>
            <code className="text-xs bg-white px-2 py-1 rounded">strategySteps</code> - Numbered strategy cards
            <pre className="text-xs bg-white p-2 mt-1 overflow-x-auto">{`[{"title":"Positioning","description":"Defined the market position"}]`}</pre>
          </li>
          <li>
            <code className="text-xs bg-white px-2 py-1 rounded">resultMetrics</code> - Impact metrics section
            <pre className="text-xs bg-white p-2 mt-1 overflow-x-auto">{`[{"value":"535%","label":"Reach Growth"},{"value":"113K+","label":"Impressions"}]`}</pre>
          </li>
          <li>
            <code className="text-xs bg-white px-2 py-1 rounded">timelineSteps</code> - Project timeline
            <pre className="text-xs bg-white p-2 mt-1 overflow-x-auto">{`[{"order":1,"title":"Discovery","description":"Initial research phase"}]`}</pre>
          </li>
          <li>
            <code className="text-xs bg-white px-2 py-1 rounded">beforeAfter</code> - Transformation section
            <pre className="text-xs bg-white p-2 mt-1 overflow-x-auto">{`{"before":"Low visibility","after":"Strong market presence"}`}</pre>
          </li>
        </ul>
        <p className="mt-3 text-xs text-blue-700">
          An enhanced admin form UI for these fields is planned for a future update.
        </p>
      </div>
    </div>
  );
}
