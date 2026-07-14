import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { ContentForm } from "@/components/admin/generic/ContentForm";
import { siteSettingsFields } from "@/lib/admin/schemas/site-settings";
import { updateSiteSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  await verifyAdminSession();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Site Settings</h1>
      <p className="mb-6 text-muted-foreground">Social links shown in the footer across the site.</p>
      <ContentForm
        fields={siteSettingsFields}
        defaultValues={{
          instagramUrl: settings?.instagramUrl ?? "",
          linkedinUrl: settings?.linkedinUrl ?? "",
          youtubeUrl: settings?.youtubeUrl ?? "",
          twitterUrl: settings?.twitterUrl ?? "",
          facebookUrl: settings?.facebookUrl ?? "",
        }}
        action={updateSiteSettings}
        redirectTo="/admin/settings"
      />
    </div>
  );
}
