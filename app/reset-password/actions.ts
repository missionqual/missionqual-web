"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthFormState } from "@/app/login/actions";
import { RECOVERY_COOKIE, recoveryUserId } from "@/src/lib/supabase/recovery";
import { createClient } from "@/src/lib/supabase/server";

export async function resetPassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!(await recoveryUserId())) redirect("/forgot-password");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };
  if (password !== confirm) return { error: "The passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error?.code === "same_password") return { error: "Choose a password you haven't used here before." };
  if (error) return { error: error.message };

  (await cookies()).delete(RECOVERY_COOKIE);
  redirect("/community?notice=password-updated");
}
