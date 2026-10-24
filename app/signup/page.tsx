import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import s from "@/src/components/auth/auth.module.css";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Join the community" };

export default function SignupPage() {
  return (
    <div className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>Join the community</h1>
        <p className={s.intro}>Straight answers from people already on data center sites.</p>
        {/* ?next= is read on the client, so the form sits behind Suspense. */}
        <Suspense fallback={<div style={{ minHeight: 420 }} />}>
          <SignupForm />
        </Suspense>
      </div>
      <p className={s.foot}>
        Already a member? <Link href="/login?next=/community">Sign in</Link>
      </p>
    </div>
  );
}
