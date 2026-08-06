import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { communityWinFields } from "@/lib/admin/schemas/community-win";
import { createCommunityWin } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCommunityWinPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Community Win</h1>
      <ContentForm
        fields={communityWinFields}
        defaultValues={{
          order: 0,
          quote: "",
          name: "",
          role: "",
          initial: "",
          cardStyle: "SAND",
          avatarStyle: "BLUE",
        }}
        action={createCommunityWin}
        redirectTo="/sbh-1111/community-wins"
      />
    </div>
  );
}
