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
    <div className="space-y-10">
      <div className="space-y-2">
        <FieldLabel htmlFor="linkedin" required>LinkedIn</FieldLabel>
        <Input id="linkedin" type="url" required placeholder="https://linkedin.com/in/your-name" {...urlField("linkedin")} />
        <p className="text-xs text-[#111111]/50">This is how our team gets to know your work before reaching out.</p>
      </div>

      <div className="rounded-[6px] border border-[#111111]/8 bg-[#FAFAF8] p-5 md:p-6">
        <p className="text-sm font-semibold text-[#111111]">Anywhere else we can find you?</p>
        <p className="mt-1 text-xs text-[#111111]/50">All optional — add whatever best shows what you do.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="instagram" required={false}>Instagram</FieldLabel>
            <Input id="instagram" type="url" placeholder="https://instagram.com/..." {...urlField("instagram")} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="twitter" required={false}>Twitter / X</FieldLabel>
            <Input id="twitter" type="url" placeholder="https://x.com/..." {...urlField("twitter")} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="youtube" required={false}>YouTube</FieldLabel>
            <Input id="youtube" type="url" placeholder="https://youtube.com/..." {...urlField("youtube")} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="website" required={false}>Website</FieldLabel>
            <Input id="website" type="url" placeholder="https://" {...urlField("website")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <FieldLabel htmlFor="portfolio" required={false}>Portfolio</FieldLabel>
            <Input id="portfolio" type="url" placeholder="https://" {...urlField("portfolio")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <FieldLabel htmlFor="podcastLinks" required={false}>Previous Podcasts</FieldLabel>
            <Input id="podcastLinks" placeholder="Paste links, separated by commas" {...listField("podcastLinks")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <FieldLabel htmlFor="articles" required={false}>Articles</FieldLabel>
            <Input id="articles" placeholder="Paste links, separated by commas" {...listField("articles")} />
          </div>
        </div>
      </div>
    </div>
  );
}
