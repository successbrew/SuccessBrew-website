"use client";

import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/apply/FieldLabel";
import { ChoiceChips } from "@/components/apply/ChoiceChips";
import type { PersonalInfo } from "@/lib/types/application";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"];

export function StepPersonal({
  value,
  onChange,
}: {
  value: Partial<PersonalInfo>;
  onChange: (patch: Partial<PersonalInfo>) => void;
}) {
  function field<K extends keyof PersonalInfo>(key: K) {
    return {
      value: value[key] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value } as Partial<PersonalInfo>),
    };
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="firstName" required>First Name</FieldLabel>
          <Input id="firstName" required autoComplete="given-name" {...field("firstName")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="lastName" required>Last Name</FieldLabel>
          <Input id="lastName" required autoComplete="family-name" {...field("lastName")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="email" required>Email</FieldLabel>
          <Input id="email" type="email" required autoComplete="email" placeholder="you@company.com" {...field("email")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="phone" required>Phone</FieldLabel>
          <Input id="phone" type="tel" required autoComplete="tel" placeholder="+91" {...field("phone")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="country" required>Country</FieldLabel>
          <Input id="country" required autoComplete="country-name" placeholder="India" {...field("country")} />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="city" required>City</FieldLabel>
          <Input id="city" required autoComplete="address-level2" {...field("city")} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="birthday" required>Birthday</FieldLabel>
          <Input id="birthday" type="date" required autoComplete="bday" {...field("birthday")} />
        </div>
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="gender" required>Gender</FieldLabel>
        <ChoiceChips
          id="gender"
          options={GENDER_OPTIONS.map((o) => ({ value: o, label: o }))}
          value={value.gender}
          onChange={(next) => onChange({ gender: next })}
        />
      </div>
    </div>
  );
}

