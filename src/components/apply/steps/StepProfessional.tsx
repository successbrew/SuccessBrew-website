"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName" required {...field("companyName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentRole">Current Role</Label>
          <Input id="currentRole" required {...field("currentRole")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="yearsExperience">Years of Experience</Label>
          <Input
            id="yearsExperience"
            type="number"
            min={0}
            value={value.yearsExperience ?? ""}
            onChange={(e) => onChange({ yearsExperience: e.target.value === "" ? undefined : Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyWebsite">Company Website</Label>
          <Input id="companyWebsite" type="url" placeholder="https://" {...field("companyWebsite")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" required {...field("industry")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="revenue">Revenue</Label>
          <Input id="revenue" {...field("revenue")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fundingStage">Funding Stage</Label>
          <Input id="fundingStage" {...field("fundingStage")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <Input id="teamSize" {...field("teamSize")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="communitySize">Community Size</Label>
          <Input id="communitySize" {...field("communitySize")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="speakingExperience">Speaking Experience</Label>
          <Input id="speakingExperience" {...field("speakingExperience")} />
        </div>
      </div>
    </div>
  );
}
