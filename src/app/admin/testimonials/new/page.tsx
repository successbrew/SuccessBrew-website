import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { testimonialFields } from "@/lib/admin/schemas/testimonial";
import { createTestimonial } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewTestimonialPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Testimonial</h1>
      <ContentForm
        fields={testimonialFields}
        defaultValues={{
          order: 0,
          quote: "",
          name: "",
          role: "",
          initial: "",
          cardStyle: "SAND",
          avatarStyle: "PRIMARY",
          showOnHomepage: false,
        }}
        action={createTestimonial}
        redirectTo="/admin/testimonials"
      />
    </div>
  );
}
