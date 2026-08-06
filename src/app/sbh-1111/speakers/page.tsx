import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function SpeakersListPage() {
  await requirePermission(PERMISSIONS.SPEAKERS_MANAGE);

  const speakers = await prisma.speaker.findMany({
    orderBy: { createdAt: "desc" },
    include: { application: { include: { category: true, subCategory: true } } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Speakers</h1>
        <p className="text-muted-foreground">
          {speakers.length} speaker{speakers.length !== 1 ? "s" : ""}. Created automatically when an application is approved.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Speaker ID</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Public</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {speakers.map((speaker) => (
            <TableRow key={speaker.id}>
              <TableCell>{speaker.displayName}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{speaker.speakerCode}</TableCell>
              <TableCell>
                {speaker.application.category?.label ?? "—"}
                {speaker.application.subCategory ? ` / ${speaker.application.subCategory.label}` : ""}
              </TableCell>
              <TableCell>
                <Badge variant={speaker.isPublic ? "secondary" : "outline"}>{speaker.isPublic ? "Public" : "Hidden"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/sbh-1111/speakers/${speaker.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {speakers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No speakers yet — approve an application and create a speaker to see them here.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
