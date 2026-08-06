import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/generic/DataTable";
import { communityEventColumns } from "@/lib/admin/schemas/community-event";
import { deleteCommunityEvent } from "./actions";

export const dynamic = "force-dynamic";

export default async function CommunityEventsListPage() {
  await verifyAdminSession();
  const communityEvents = await prisma.communityEvent.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Community Events</h1>
        <Button asChild>
          <Link href="/sbh-1111/community-events/new">New Community Event</Link>
        </Button>
      </div>
      <DataTable
        rows={communityEvents}
        columns={communityEventColumns}
        editHrefBase="/sbh-1111/community-events"
        deleteAction={deleteCommunityEvent}
      />
    </div>
  );
}
