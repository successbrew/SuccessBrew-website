import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { testimonialFields } from "@/lib/admin/schemas/testimonial";
import { updateTestimonial } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Testimonial</h1>
      <ContentForm
        fields={testimonialFields}
        defaultValues={{
          ...testimonial,
          cardStyle: testimonial.cardStyle as "SAND" | "DARK",
          avatarStyle: testimonial.avatarStyle as "PRIMARY" | "ACCENT",
        }}
        action={updateTestimonial.bind(null, testimonial.id)}
        redirectTo="/admin/testimonials"
      />
    </div>
  );
}
