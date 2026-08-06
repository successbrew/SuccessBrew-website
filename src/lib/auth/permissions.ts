import type { AdminRole } from "@prisma/client";

/**
 * Every capability any admin route/action can gate on. Add new keys here as
 * later modules need them — role -> permission wiring is the single map below,
 * never scattered `roles.includes(...)` checks at call sites.
 */
export const PERMISSIONS = {
  CONTENT_MANAGE: "content:manage",
  USERS_MANAGE: "users:manage",
  APPLICATIONS_REVIEW: "applications:review",
  APPLICATIONS_APPROVE: "applications:approve",
  SPEAKERS_MANAGE: "speakers:manage",
  PODCASTS_MANAGE: "podcasts:manage",
  COMMUNITY_MANAGE: "community:manage",
  ANALYTICS_VIEW: "analytics:view",
  AUDIT_VIEW: "audit:view",
  SETTINGS_MANAGE: "settings:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  REVIEWER: "Reviewer",
  COMMUNITY_MANAGER: "Community Manager",
  PODCAST_MANAGER: "Podcast Manager",
  CONTENT_MANAGER: "Content Manager",
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  // Also handled as an implicit bypass in hasPermission() below.
  SUPER_ADMIN: ALL_PERMISSIONS,
  ADMIN: [
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.APPLICATIONS_REVIEW,
    PERMISSIONS.APPLICATIONS_APPROVE,
    PERMISSIONS.SPEAKERS_MANAGE,
    PERMISSIONS.PODCASTS_MANAGE,
    PERMISSIONS.COMMUNITY_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
  ],
  REVIEWER: [PERMISSIONS.APPLICATIONS_REVIEW, PERMISSIONS.ANALYTICS_VIEW],
  COMMUNITY_MANAGER: [PERMISSIONS.COMMUNITY_MANAGE, PERMISSIONS.CONTENT_MANAGE, PERMISSIONS.ANALYTICS_VIEW],
  PODCAST_MANAGER: [PERMISSIONS.PODCASTS_MANAGE, PERMISSIONS.ANALYTICS_VIEW],
  CONTENT_MANAGER: [PERMISSIONS.CONTENT_MANAGE],
};

export function hasPermission(roles: AdminRole[], permission: Permission): boolean {
  if (roles.includes("SUPER_ADMIN")) return true;
  return roles.some((role) => ROLE_PERMISSIONS[role].includes(permission));
}
