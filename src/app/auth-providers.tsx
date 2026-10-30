"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth/client";

const ADMIN_HOST_PREFIX = "sbh-1111.";

/**
 * Neon Auth's UI provider, used only by the /auth and /account pages. It wraps
 * its children in a theme provider that injects an inline <script> (blocked by
 * the CSP and flagged by React), so it isn't mounted on the public site.
 */
export function AuthProviders({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => {
        // Signing in from successbrew.in must hand off to the admin
        // subdomain — a client-side router.push can't cross hosts.
        if (typeof window !== "undefined" && !window.location.host.startsWith(ADMIN_HOST_PREFIX)) {
          // Cross-subdomain hop — router.push can't leave the current host.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `${window.location.protocol}//${ADMIN_HOST_PREFIX}${window.location.host}/sbh-1111`;
          return;
        }
        router.refresh();
      }}
      redirectTo="/sbh-1111"
      Link={Link}
      defaultTheme="light"
      signUp={false}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
