"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "./actions";

export type Profile = {
  display_name: string | null;
  job_title: string | null;
  industry: string | null;
  years_experience: number | null;
  certifications: string[] | null;
  disciplines: string[] | null;
  career_intent: string | null;
  location: string | null;
};

const initialState: ProfileFormState = {};

function Field({
  label,
  name,
  defaultValue,
  ...rest
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  return (
    <label className="flex flex-col gap-1">
      {label}
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        className="border px-2 py-1"
        {...rest}
      />
    </label>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={action} className="flex flex-col gap-3">
      <Field label="Display name" name="display_name" defaultValue={profile.display_name} required />
      <Field label="Job title" name="job_title" defaultValue={profile.job_title} />
      <Field label="Industry" name="industry" defaultValue={profile.industry} />
      <Field
        label="Years of experience"
        name="years_experience"
        type="number"
        min={0}
        step={1}
        defaultValue={profile.years_experience}
      />
      <Field
        label="Certifications (comma-separated)"
        name="certifications"
        defaultValue={profile.certifications?.join(", ")}
      />
      <Field
        label="Disciplines (comma-separated)"
        name="disciplines"
        defaultValue={profile.disciplines?.join(", ")}
      />
      <Field label="Career intent" name="career_intent" defaultValue={profile.career_intent} />
      <Field label="Location" name="location" defaultValue={profile.location} />
      {state.error && <p role="alert" className="text-red-600">{state.error}</p>}
      {state.message && <p role="status" className="text-green-700">{state.message}</p>}
      <button type="submit" disabled={pending} className="border px-3 py-1">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
