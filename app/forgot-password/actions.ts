"use server";

import type { AuthFormState } from "@/app/login/actions";
import { createClient } from "@/src/lib/supabase/server";
import { getSiteUrl } from "@/src/lib/site-url";
import { tooSoon } from "@/src/lib/throttle";

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };
  if (tooSoon(`reset:${email.toLowerCase()}`)) {
    return { error: "We just sent a link. Wait a minute before asking again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await getSiteUrl()}/auth/confirm?next=/reset-password`,
  });
  // Same answer whether or not the account exists. Log only the error code.
  if (error && error.status !== 429) console.error(`[auth] password reset request failed: ${error.code ?? error.status}`);

  return { message: `If there's an account for ${email}, a reset link is on its way. Check your spam folder too.` };
}
