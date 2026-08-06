import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { path } = await params;
  const { redirectTo } = await searchParams;
  // Only ever redirect to a relative in-app path — never let a query param send someone off-site.
  const safeRedirectTo = redirectTo?.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : undefined;

  return (
    <main className="container mx-auto flex grow flex-col items-center justify-center p-4">
      <AuthView path={path} redirectTo={safeRedirectTo} />
    </main>
  );
}
