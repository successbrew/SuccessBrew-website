"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { MotionConfig } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth/client";

const ADMIN_HOST_PREFIX = "sbh-1111.";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <MotionConfig reducedMotion="user">
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
    </MotionConfig>
  );
}
