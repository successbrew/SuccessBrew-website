"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFileUpload } from "../useFileUpload";
import type { PersonalInfo } from "@/lib/types/application";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"];

export function StepPersonal({
  value,
  onChange,
}: {
  value: Partial<PersonalInfo>;
  onChange: (patch: Partial<PersonalInfo>) => void;
}) {
  const { upload, isUploading, error } = useFileUpload();

  function field<K extends keyof PersonalInfo>(key: K) {
    return {
      value: value[key] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value } as Partial<PersonalInfo>),
    };
  }

  async function handleHeadshot(file: File) {
    const url = await upload(file);
    if (url) onChange({ headshotUrl: url });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" required {...field("firstName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" required {...field("lastName")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required {...field("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" required {...field("phone")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" required {...field("country")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" required {...field("city")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="birthday">Birthday</Label>
          <Input id="birthday" type="date" required {...field("birthday")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={value.gender ?? ""} onValueChange={(next) => onChange({ gender: next })}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="headshot">Headshot</Label>
        <input
          id="headshot"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleHeadshot(file);
          }}
        />
        {isUploading && <p className="text-sm text-[#111111]/50">Uploading…</p>}
        {value.headshotUrl && !isUploading && (
          <p className="text-sm text-[#0037D2]">Headshot uploaded ✓</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
