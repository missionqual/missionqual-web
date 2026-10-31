"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { ABOUT_MAX, REQUIRED_MESSAGES, isDcStatus, isIndustry } from "@/src/lib/community/constants";
import { safeNext } from "@/src/lib/community/format";
import { createClient } from "@/src/lib/supabase/server";

export type ProfileField = "display_name" | "job_title" | "industry" | "dc_status" | "location" | "years_experience" | "about";

export type ProfileFormState = {
  errors?: Partial<Record<ProfileField, string>>;
  error?: string;
  saved?: boolean;
};

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

/**
 * Saves the profile from /welcome and /account. /welcome then goes on to the
 * community (or the ?next= it came with); /account shows "Saved.".
 * came_from and disciplines aren't on the form any more and are left as they are.
 */
export async function saveProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const supabase = await createClient();
  // Re-verify the user inside the action; never trust the client.
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const welcome = formData.get("mode") === "welcome";
  if (!userId) redirect(welcome ? "/login?next=/welcome" : "/login?next=/account");

  const displayName = text(formData, "display_name");
  const jobTitle = text(formData, "job_title");
  const industry = text(formData, "industry");
  const dcStatus = text(formData, "dc_status");
  const location = text(formData, "location");
  const about = text(formData, "about");
  const yearsRaw = text(formData, "years_experience");
  const years = yearsRaw === null ? null : Number(yearsRaw);

  const errors: ProfileFormState["errors"] = {};
  if (!displayName) errors.display_name = REQUIRED_MESSAGES.display_name;
  if (!jobTitle) errors.job_title = REQUIRED_MESSAGES.job_title;
  if (!isIndustry(industry)) errors.industry = REQUIRED_MESSAGES.industry;
  if (!isDcStatus(dcStatus)) errors.dc_status = REQUIRED_MESSAGES.dc_status;
  if (!location) errors.location = REQUIRED_MESSAGES.location;
  if (years !== null && (!Number.isInteger(years) || years < 0 || years > 70)) {
    errors.years_experience = "Use a whole number, e.g. 10.";
  }
  if (about && about.length > ABOUT_MAX) errors.about = `Keep it under ${ABOUT_MAX} characters.`;
  if (Object.keys(errors).length) return { errors };

  // Upserts only the member's own row (RLS). Columns not listed here are left as they are.
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    display_name: displayName,
    job_title: jobTitle,
    industry,
    dc_status: dcStatus,
    location,
    years_experience: years,
    certifications: list(formData, "certifications"),
    about,
    email_on_reply: formData.get("email_on_reply") === "on",
  });
  if (error) return { error: "Couldn't save your profile. Try again." };

  if (welcome) redirect(safeNext(formData.get("dest"), "/community?welcome=1"));
  refresh();
  return { saved: true };
}
