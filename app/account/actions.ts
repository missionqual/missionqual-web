"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

export type ProfileFormState = { error?: string; message?: string };

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

// Comma-separated input -> text[] column.
function list(formData: FormData, key: string) {
  const items = String(formData.get(key) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : null;
}

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  // Re-verify the user inside the action; never trust the client.
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login");

  const yearsRaw = text(formData, "years_experience");
  const years = yearsRaw === null ? null : Number(yearsRaw);
  if (years !== null && (!Number.isInteger(years) || years < 0)) {
    return { error: "Years of experience must be a whole number." };
  }

  const displayName = text(formData, "display_name");
  if (!displayName) return { error: "Display name is required." };

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    display_name: displayName,
    job_title: text(formData, "job_title"),
    industry: text(formData, "industry"),
    years_experience: years,
    certifications: list(formData, "certifications"),
    disciplines: list(formData, "disciplines"),
    career_intent: text(formData, "career_intent"),
    location: text(formData, "location"),
  });
  if (error) return { error: error.message };

  refresh();
  return { message: "Profile saved." };
}
