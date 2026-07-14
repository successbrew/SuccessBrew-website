import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { testimonialColumns } from "@/lib/admin/schemas/testimonial";
import { deleteTestimonial } from "./actions";

export const dynamic = "force-dynamic";

export default async function TestimonialsListPage() {
  await verifyAdminSession();
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Testimonials</h1>
        <Button asChild>
          <Link href="/admin/testimonials/new">New Testimonial</Link>
        </Button>
      </div>
      <DataTable
        rows={testimonials}
        columns={testimonialColumns}
        editHrefBase="/admin/testimonials"
        deleteAction={deleteTestimonial}
      />
    </div>
  );
}
