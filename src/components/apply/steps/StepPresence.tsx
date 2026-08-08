"use client";

import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/apply/FieldLabel";
import type { ProfessionalInfo } from "@/lib/types/application";

type Socials = NonNullable<ProfessionalInfo["socials"]>;

export function StepPresence({
  value,
  onChange,
}: {
  value: Partial<Socials>;
  onChange: (patch: Partial<Socials>) => void;
}) {
  function urlField<K extends keyof Socials>(key: K) {
    return {
      value: (value[key] as string) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value } as Partial<Socials>),
    };
  }

  function listField(key: "podcastLinks" | "articles") {
    return {
      value: (value[key] ?? []).join(", "),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange({ [key]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } as Partial<Socials>),
    };
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="linkedin" required>LinkedIn</FieldLabel>
          <Input id="linkedin" type="url" required placeholder="https://linkedin.com/in/..." {...urlField("linkedin")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="instagram" required={false}>Instagram</FieldLabel>
          <Input id="instagram" type="url" placeholder="https://instagram.com/..." {...urlField("instagram")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="twitter" required={false}>Twitter / X</FieldLabel>
          <Input id="twitter" type="url" placeholder="https://x.com/..." {...urlField("twitter")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="youtube" required={false}>YouTube</FieldLabel>
          <Input id="youtube" type="url" placeholder="https://youtube.com/..." {...urlField("youtube")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="website" required={false}>Website</FieldLabel>
          <Input id="website" type="url" placeholder="https://" {...urlField("website")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="portfolio" required={false}>Portfolio</FieldLabel>
          <Input id="portfolio" type="url" placeholder="https://" {...urlField("portfolio")} />
        </div>
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="podcastLinks" required={false}>Previous Podcasts (comma-separated links)</FieldLabel>
        <Input id="podcastLinks" {...listField("podcastLinks")} />
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="articles" required={false}>Articles (comma-separated links)</FieldLabel>
        <Input id="articles" {...listField("articles")} />
      </div>
    </div>
  );
}
