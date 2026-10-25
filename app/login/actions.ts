"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { safeNext } from "@/src/lib/community/format";
import { getSiteUrl } from "@/src/lib/site-url";
import { tooSoon } from "@/src/lib/throttle";

export type AuthFormState = { error?: string; message?: string; unconfirmedEmail?: string };

export async function loginWithPassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") return { unconfirmedEmail: email };
  if (error) return { error: error.message };

  redirect(safeNext(formData.get("next"), "/account"));
}

/** Resends the signup confirmation link, at most once a minute per address. */
export async function resendConfirmation(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required." };
  if (tooSoon(`resend:${email.toLowerCase()}`)) {
    return { error: "We just sent one. Wait a minute before asking again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${await getSiteUrl()}/auth/confirm?next=${encodeURIComponent("/account?welcome=1")}`,
    },
  });
  if (error?.status === 429) return { error: "We just sent one. Wait a minute before asking again." };
  if (error) return { error: error.message };

  return { message: `Sent. Check ${email} and your spam folder.` };
}
