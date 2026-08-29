import { describe, it, expect } from "vitest";
import { canTransition, legalNextStatuses } from "./status-transitions";
import { ApplicationStatus } from "@prisma/client";

describe("canTransition", () => {
  it("allows the normal review path to approval", () => {
    expect(canTransition(ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW)).toBe(true);
    expect(canTransition(ApplicationStatus.UNDER_REVIEW, ApplicationStatus.APPROVED)).toBe(true);
  });

  it("rejects skipping straight from SUBMITTED to APPROVED", () => {
    expect(canTransition(ApplicationStatus.SUBMITTED, ApplicationStatus.APPROVED)).toBe(false);
  });

  it("rejects moving backwards out of a terminal-ish state", () => {
    // PUBLISHED has no legal next state at all.
    expect(legalNextStatuses(ApplicationStatus.PUBLISHED)).toEqual([]);
    expect(canTransition(ApplicationStatus.PUBLISHED, ApplicationStatus.DRAFT)).toBe(false);
  });

  it("rejects re-approving an already-approved application", () => {
    // APPROVED's only legal next state is SPEAKER_CREATED — not itself.
    expect(canTransition(ApplicationStatus.APPROVED, ApplicationStatus.APPROVED)).toBe(false);
  });

  it("allows a rejected application to be archived, but not un-rejected into review", () => {
    expect(canTransition(ApplicationStatus.REJECTED, ApplicationStatus.ARCHIVED)).toBe(true);
    expect(canTransition(ApplicationStatus.REJECTED, ApplicationStatus.UNDER_REVIEW)).toBe(false);
  });

  it("every ApplicationStatus value has an entry in the transition table", () => {
    // Guards against a future new enum value silently falling through
    // canTransition() as "no legal moves" because it was never added above.
    for (const status of Object.values(ApplicationStatus)) {
      expect(() => legalNextStatuses(status)).not.toThrow();
      expect(Array.isArray(legalNextStatuses(status))).toBe(true);
    }
  });
});
