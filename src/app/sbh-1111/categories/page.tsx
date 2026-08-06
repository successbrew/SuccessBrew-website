import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { subCategoryColumns } from "@/lib/admin/schemas/sub-category";
import { deleteSubCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await verifyAdminSession();

  const subCategories = await prisma.subCategory.findMany({
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    include: { category: true },
  });
  const rows = subCategories.map((sc) => ({
    id: sc.id,
    order: sc.order,
    label: sc.label,
    categoryLabel: sc.category.label,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-muted-foreground">
            Sub-category options shown in the Apply wizard&rsquo;s category dropdown. The 4 major categories
            (Enabler, D2C, Tech Founder, Investor) are fixed; add or edit sub-categories here.
          </p>
        </div>
        <Button asChild>
          <Link href="/sbh-1111/categories/new">New Sub-Category</Link>
        </Button>
      </div>
      <DataTable
        rows={rows}
        columns={subCategoryColumns}
        editHrefBase="/sbh-1111/categories"
        deleteAction={deleteSubCategory}
      />
    </div>
  );
}
