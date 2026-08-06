import Link from "next/link";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  const { data: session } = await auth.getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="text-muted-foreground max-w-md">
        {session?.user
          ? `${session.user.email} doesn't have an admin role on this account yet. Ask a Super Admin to invite you.`
          : "You don't have permission to view this page."}
      </p>
      <Link href="/" className="text-primary underline">
        Back to the site
      </Link>
    </main>
  );
}
