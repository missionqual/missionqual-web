"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { getSiteUrl } from "@/src/lib/site-url";
import type { AuthFormState } from "@/app/login/actions";

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  if (!email || !password || !displayName) {
    return { error: "Email, password and display name are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Stored in user metadata; /account uses it to seed the profile row.
      data: { display_name: displayName },
      emailRedirectTo: `${await getSiteUrl()}/auth/confirm?next=/account`,
    },
  });
  if (error) return { error: error.message };

  // Email confirmation disabled: we already have a session.
  if (data.session) {
    await supabase
      .from("profiles")
      .upsert({ id: data.session.user.id, display_name: displayName });
    redirect("/account");
  }

  return { message: "Check your email to confirm your account." };
}
