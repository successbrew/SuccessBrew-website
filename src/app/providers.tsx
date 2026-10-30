"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { MOTION_CONFIG_REDUCED } from "@/lib/motion-policy";

// Site-wide client providers. Neon Auth's UI provider lives in ./auth-providers
// and is mounted only by the /auth and /account layouts.
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion={MOTION_CONFIG_REDUCED}>{children}</MotionConfig>;
}
