"use server";

import { redirect } from "next/navigation";
import type { AuthFormState } from "@/app/login/actions";
import { safeNext } from "@/src/lib/community/format";
import { syncCommunityMember } from "@/src/lib/community/sync";
import { createClient } from "@/src/lib/supabase/server";
import { getSiteUrl } from "@/src/lib/site-url";

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  if (!email || !password || !displayName) {
    return { error: "Full name, email and password are required." };
  }
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };

  const next = safeNext(formData.get("next"), "/account?welcome=1");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Stored in user metadata; /account uses it to seed the profile row.
      data: { display_name: displayName },
      emailRedirectTo: `${await getSiteUrl()}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message };

  // Email confirmation disabled: we already have a session.
  if (data.session) {
    await supabase
      .from("profiles")
      .upsert({ id: data.session.user.id, display_name: displayName });
    await syncCommunityMember();
    redirect(next);
  }

  return { message: "Check your email to confirm your account." };
}
