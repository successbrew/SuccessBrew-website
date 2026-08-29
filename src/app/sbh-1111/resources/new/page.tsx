import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { resourceFields } from "@/lib/admin/schemas/resource";
import { OFFER_PRODUCT } from "@/lib/commerce/product";
import { createResource } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewResourcePage() {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">New Resource</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        The ₹2,999 offer looks for a Resource with slug <code className="rounded bg-muted px-1.5 py-0.5">{OFFER_PRODUCT.resourceSlug}</code> and
        grants access to it automatically when a payment is confirmed — set its URL to the Koursely course link.
      </p>
      <ContentForm
        fields={resourceFields}
        defaultValues={{
          title: "",
          slug: "",
          description: "",
          resourceType: "course",
          url: "",
          accessLevel: "PAID",
          isPublished: false,
          order: 0,
        }}
        action={createResource}
        redirectTo="/sbh-1111/resources"
      />
    </div>
  );
}
