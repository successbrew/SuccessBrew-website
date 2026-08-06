"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input id="linkedin" type="url" required placeholder="https://linkedin.com/in/..." {...urlField("linkedin")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" type="url" placeholder="https://instagram.com/..." {...urlField("instagram")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter / X</Label>
          <Input id="twitter" type="url" placeholder="https://x.com/..." {...urlField("twitter")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube</Label>
          <Input id="youtube" type="url" placeholder="https://youtube.com/..." {...urlField("youtube")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" type="url" placeholder="https://" {...urlField("website")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio</Label>
          <Input id="portfolio" type="url" placeholder="https://" {...urlField("portfolio")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="podcastLinks">Previous Podcasts (comma-separated links)</Label>
        <Input id="podcastLinks" {...listField("podcastLinks")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="articles">Articles (comma-separated links)</Label>
        <Input id="articles" {...listField("articles")} />
      </div>
    </div>
  );
}
