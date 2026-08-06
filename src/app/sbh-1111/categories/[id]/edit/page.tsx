import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { subCategoryFields } from "@/lib/admin/schemas/sub-category";
import { updateSubCategory } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditSubCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();
  const { id } = await params;
  const [subCategory, categories] = await Promise.all([
    prisma.subCategory.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!subCategory) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Sub-Category</h1>
      <ContentForm
        fields={subCategoryFields(categories.map((c) => ({ value: c.id, label: c.label })))}
        defaultValues={subCategory}
        action={updateSubCategory.bind(null, subCategory.id)}
        redirectTo="/sbh-1111/categories"
      />
    </div>
  );
}
