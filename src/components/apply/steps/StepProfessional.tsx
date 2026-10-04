"use client";

import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/apply/FieldLabel";
import type { DraftProfessionalInfo } from "@/lib/types/application";

export function StepProfessional({
  value,
  onChange,
}: {
  value: DraftProfessionalInfo;
  onChange: (patch: Partial<DraftProfessionalInfo>) => void;
}) {
  function field<K extends keyof Omit<DraftProfessionalInfo, "socials">>(key: K) {
    return {
      value: (value[key] as string) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value } as Partial<DraftProfessionalInfo>),
    };
  }

  return (
    <div className="space-y-10">
      {/* Required basics */}
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="companyName" required>Company Name</FieldLabel>
            <Input id="companyName" required autoComplete="organization" {...field("companyName")} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="currentRole" required>Current Role</FieldLabel>
            <Input id="currentRole" required autoComplete="organization-title" placeholder="e.g. Founder & CEO" {...field("currentRole")} />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="industry" required>Industry</FieldLabel>
            <Input id="industry" required placeholder="e.g. Fintech, D2C, SaaS" {...field("industry")} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="yearsExperience" required>Years of Experience</FieldLabel>
            <Input
              id="yearsExperience"
              type="number"
              min={0}
              required
              value={value.yearsExperience ?? ""}
              onChange={(e) => onChange({ yearsExperience: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="companyWebsite" required={false}>Company Website</FieldLabel>
          <Input id="companyWebsite" type="url" placeholder="https://" {...field("companyWebsite")} />
        </div>
      </div>

      {/* Optional extras, grouped so they don't feel like homework */}
      <div className="rounded-[6px] border border-[#111111]/8 bg-[#FAFAF8] p-5 md:p-6">
        <p className="text-sm font-semibold text-[#111111]">A little more context</p>
        <p className="mt-1 text-xs text-[#111111]/50">All optional — but they help us match you with the right people and rooms.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="revenue" required={false}>Revenue</FieldLabel>
            <Input id="revenue" placeholder="e.g. ₹1–5 Cr" {...field("revenue")} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="fundingStage" required={false}>Funding Stage</FieldLabel>
            <Input id="fundingStage" placeholder="e.g. Bootstrapped, Seed" {...field("fundingStage")} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="teamSize" required={false}>Team Size</FieldLabel>
            <Input id="teamSize" placeholder="e.g. 12" {...field("teamSize")} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="communitySize" required={false}>Community Size</FieldLabel>
            <Input id="communitySize" placeholder="e.g. 25K followers" {...field("communitySize")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <FieldLabel htmlFor="speakingExperience" required={false}>Speaking Experience</FieldLabel>
            <Input id="speakingExperience" placeholder="Talks, panels or podcasts you've done" {...field("speakingExperience")} />
          </div>
        </div>
      </div>
    </div>
  );
}
