import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { subCategoryFields } from "@/lib/admin/schemas/sub-category";
import { createSubCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewSubCategoryPage() {
  await verifyAdminSession();
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Sub-Category</h1>
      <ContentForm
        fields={subCategoryFields(categories.map((c) => ({ value: c.id, label: c.label })))}
        defaultValues={{ categoryId: categories[0]?.id ?? "", label: "", order: 0 }}
        action={createSubCategory}
        redirectTo="/sbh-1111/categories"
      />
    </div>
  );
}
