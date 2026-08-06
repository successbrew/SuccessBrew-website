"use client";

import { useCallback, useEffect, useState } from "react";
import type { PersonalInfo, DraftProfessionalInfo, DocumentKind } from "@/lib/types/application";

const STORAGE_KEY = "sb_application_draft_v2";

/** Draft state is always allowed to be incomplete — required-ness (e.g. LinkedIn) is
 * only enforced at submit time by the Zod schemas, not by these in-progress types. */
export interface ApplicationDraft {
  currentStep: number;
  categoryId?: string;
  subCategoryId?: string;
  personal: Partial<PersonalInfo>;
  professional: DraftProfessionalInfo;
  documents: Partial<Record<DocumentKind, string>>;
}

const EMPTY_DRAFT: ApplicationDraft = {
  currentStep: 0,
  personal: {},
  professional: {},
  documents: {},
};

/**
 * Anonymous applicants fill out the wizard before logging in (see /apply
 * design notes), so there's no user id to key a server-side draft by yet —
 * progress lives entirely in localStorage until the final authenticated
 * submit, which is also what survives the redirect out to /auth/sign-in and
 * back.
 */
export function useApplicationDraft() {
  const [draft, setDraft] = useState<ApplicationDraft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Hydrating from localStorage (an external store) must happen post-mount to
      // stay SSR-safe — the sanctioned exception to "don't setState in an effect".
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setDraft({ ...EMPTY_DRAFT, ...JSON.parse(raw) });
    } catch {
      // corrupt/blocked storage — fall back to an empty draft
    }
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<ApplicationDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage full/blocked — draft still works for this session, just won't survive a reload
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setDraft(EMPTY_DRAFT);
  }, []);

  return { draft, update, clear, hydrated };
}
