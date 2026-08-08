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
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="companyName" required>Company Name</FieldLabel>
          <Input id="companyName" required {...field("companyName")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="currentRole" required>Current Role</FieldLabel>
          <Input id="currentRole" required {...field("currentRole")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
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
        <div className="space-y-2">
          <FieldLabel htmlFor="companyWebsite" required={false}>Company Website</FieldLabel>
          <Input id="companyWebsite" type="url" placeholder="https://" {...field("companyWebsite")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="industry" required>Industry</FieldLabel>
          <Input id="industry" required {...field("industry")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="revenue" required={false}>Revenue</FieldLabel>
          <Input id="revenue" {...field("revenue")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="fundingStage" required={false}>Funding Stage</FieldLabel>
          <Input id="fundingStage" {...field("fundingStage")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="teamSize" required={false}>Team Size</FieldLabel>
          <Input id="teamSize" {...field("teamSize")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="communitySize" required={false}>Community Size</FieldLabel>
          <Input id="communitySize" {...field("communitySize")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="speakingExperience" required={false}>Speaking Experience</FieldLabel>
          <Input id="speakingExperience" {...field("speakingExperience")} />
        </div>
      </div>
    </div>
  );
}
