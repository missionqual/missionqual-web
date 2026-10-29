import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import s from "@/src/components/auth/auth.module.css";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <div className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>Reset your password</h1>
        <p className={s.intro}>Enter the email you signed up with and we&rsquo;ll send you a link to set a new one.</p>
        {/* ?error= is read on the client, so the form sits behind Suspense. */}
        <Suspense fallback={<div style={{ minHeight: 160 }} />}>
          <ForgotForm />
        </Suspense>
      </div>
      <p className={s.foot}>
        Remembered it? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
