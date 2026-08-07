"use client";

import { useCallback, useEffect, useState } from "react";
import type { PersonalInfo, DraftProfessionalInfo, DocumentKind } from "@/lib/types/application";

const STORAGE_KEY = "sb_application_draft_v2";

/** Bump whenever ApplicationDraft's shape changes — any stored draft tagged with
 * an older/foreign version is discarded rather than risk crashing the page by
 * merging a shape the current components don't expect. */
const DRAFT_VERSION = 2;
/** Keep in sync with ApplyWizardClient's TOTAL_STEPS - 1. */
const MAX_STEP_INDEX = 4;

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Turns whatever JSON.parse handed back into a safe ApplicationDraft, or null if
 * it isn't one — an untagged/mismatched version, or any of the container fields
 * having been swapped for something unexpected (null, an array, a string), is
 * exactly what let a stale draft crash the page instead of just rendering wrong.
 */
function normalizeStoredDraft(parsed: unknown): ApplicationDraft | null {
  if (!isPlainObject(parsed) || parsed.version !== DRAFT_VERSION) return null;

  const currentStep =
    typeof parsed.currentStep === "number" && Number.isFinite(parsed.currentStep)
      ? Math.min(Math.max(Math.trunc(parsed.currentStep), 0), MAX_STEP_INDEX)
      : 0;

  return {
    currentStep,
    categoryId: typeof parsed.categoryId === "string" ? parsed.categoryId : undefined,
    subCategoryId: typeof parsed.subCategoryId === "string" ? parsed.subCategoryId : undefined,
    personal: isPlainObject(parsed.personal) ? (parsed.personal as Partial<PersonalInfo>) : {},
    professional: isPlainObject(parsed.professional) ? (parsed.professional as DraftProfessionalInfo) : {},
    documents: isPlainObject(parsed.documents) ? (parsed.documents as Partial<Record<DocumentKind, string>>) : {},
  };
}

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
  const [discardedInvalidDraft, setDiscardedInvalidDraft] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const normalized = normalizeStoredDraft(JSON.parse(raw));
        if (normalized) {
          // Hydrating from localStorage (an external store) must happen post-mount to
          // stay SSR-safe — the sanctioned exception to "don't setState in an effect".
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDraft(normalized);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setDiscardedInvalidDraft(true);
        }
      }
    } catch {
      // corrupt JSON/blocked storage — fall back to an empty draft
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<ApplicationDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, version: DRAFT_VERSION }));
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

  return { draft, update, clear, hydrated, discardedInvalidDraft };
}
