import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import s from "@/src/components/auth/auth.module.css";
import { recoveryUserId } from "@/src/lib/supabase/recovery";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return (
    <div className={s.page}>
      {/* The session is read at request time, so it streams in behind Suspense. */}
      <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
        <Reset />
      </Suspense>
    </div>
  );
}

/** Only for a session that came from a password-reset link. */
async function Reset() {
  if (!(await recoveryUserId())) redirect("/forgot-password");
  return (
    <div className={s.card}>
      <h1 className={s.title}>Set a new password</h1>
      <p className={s.intro}>Choose a new password for your MissionQual account.</p>
      <ResetForm />
    </div>
  );
}
