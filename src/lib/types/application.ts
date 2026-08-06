/** Wizard step 1 — stored in Application.personal. */
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  birthday: string; // ISO date (yyyy-mm-dd)
  gender: string;
  headshotUrl?: string;
}

/** Wizard steps 3-4 — stored in Application.professional. */
export interface ProfessionalInfo {
  companyName?: string;
  currentRole?: string;
  yearsExperience?: number;
  companyWebsite?: string;
  industry?: string;
  revenue?: string;
  fundingStage?: string;
  teamSize?: string;
  communitySize?: string;
  speakingExperience?: string;
  socials: {
    linkedin: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
    portfolio?: string;
    podcastLinks?: string[];
    articles?: string[];
  };
}

/** Uploads — one row per file in the Document table. */
export type DocumentKind = "RESUME" | "MEDIA_KIT" | "DECK" | "LOGO" | "HEADSHOT";

/** In-progress wizard state is always allowed to be incomplete — required-ness
 * (e.g. LinkedIn) is only enforced at submit time by the Zod schemas. */
export type DraftProfessionalInfo = Partial<Omit<ProfessionalInfo, "socials">> & {
  socials?: Partial<ProfessionalInfo["socials"]>;
};
