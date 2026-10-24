"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { ABOUT_MAX, isDcStatus } from "@/src/lib/community/constants";
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
  return items.length ? [...new Set(items)] : null;
}

// Checkbox group -> text[] column.
function checked(formData: FormData, key: string) {
  const items = formData
    .getAll(key)
    .map((v) => String(v).trim())
    .filter(Boolean);
  return items.length ? [...new Set(items)] : null;
}

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  // Re-verify the user inside the action; never trust the client.
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login?next=/account");

  const yearsRaw = text(formData, "years_experience");
  const years = yearsRaw === null ? null : Number(yearsRaw);
  if (years !== null && (!Number.isInteger(years) || years < 0 || years > 70)) {
    return { error: "Years of experience must be a whole number." };
  }

  const displayName = text(formData, "display_name");
  if (!displayName) return { error: "Full name is required." };

  const dcStatus = text(formData, "dc_status");
  const about = text(formData, "about");
  if (about && about.length > ABOUT_MAX) return { error: `Keep About under ${ABOUT_MAX} characters.` };
  const cameFrom = text(formData, "came_from");
  if (cameFrom && cameFrom.length > 200) return { error: "Keep Came from under 200 characters." };

  // Upserts only the member's own row (RLS). Columns not listed here are left as they are.
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    display_name: displayName,
    job_title: text(formData, "job_title"),
    dc_status: isDcStatus(dcStatus) ? dcStatus : null,
    years_experience: years,
    certifications: list(formData, "certifications"),
    disciplines: checked(formData, "disciplines"),
    location: text(formData, "location"),
    came_from: cameFrom,
    about,
    email_on_reply: formData.get("email_on_reply") === "on",
  });
  if (error) return { error: error.message };

  refresh();
  return { message: "Profile saved." };
}
