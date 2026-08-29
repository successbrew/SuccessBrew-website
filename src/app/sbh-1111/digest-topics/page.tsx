import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { digestTopicColumns } from "@/lib/admin/schemas/digest-topic";
import { SendDigestNowButton } from "@/components/admin/digest/SendDigestNowButton";
import { deleteDigestTopic, sendDigestNowAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function DigestTopicsListPage() {
  await requirePermission(PERMISSIONS.COMMERCE_MANAGE);
  const topics = await prisma.digestTopic.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Daily Digest Topics</h1>
          <p className="text-sm text-muted-foreground">
            Paid members pick from this list. Each active topic gets one AI-generated brief per day, shared across
            everyone who follows it.
          </p>
        </div>
        <Button asChild>
          <Link href="/sbh-1111/digest-topics/new">New Topic</Link>
        </Button>
      </div>

      <div className="mb-6">
        <SendDigestNowButton action={sendDigestNowAction} />
      </div>

      <DataTable
        rows={topics}
        columns={digestTopicColumns}
        editHrefBase="/sbh-1111/digest-topics"
        deleteAction={deleteDigestTopic}
      />
    </div>
  );
}
