import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { communityEventFields } from "@/lib/admin/schemas/community-event";
import { createCommunityEvent } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCommunityEventPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Community Event</h1>
      <ContentForm
        fields={communityEventFields}
        defaultValues={{
          order: 0,
          isFeatured: false,
          tag: "",
          title: "",
          date: "",
          eventDate: new Date().toISOString().slice(0, 10),
          category: "GENERAL",
          location: "",
          speaker: "",
          imageUrl: "",
          registerUrl: "",
          seatsNote: "",
        }}
        action={createCommunityEvent}
        redirectTo="/sbh-1111/community-events"
      />
    </div>
  );
}
