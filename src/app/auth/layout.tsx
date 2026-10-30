import type { ReactNode } from "react";
import { AuthProviders } from "../auth-providers";

export default function Layout({ children }: { children: ReactNode }) {
  return <AuthProviders>{children}</AuthProviders>;
}
