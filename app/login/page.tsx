import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import s from "@/src/components/auth/auth.module.css";
import { LinkError } from "./link-error";
import { LoginForms, SignupLink } from "./login-forms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>Sign in</h1>
        <p className={s.intro}>Welcome back to the MissionQual community.</p>
        {/* ?next= and ?error= are read on the client, so these sit behind Suspense. */}
        <Suspense fallback={null}>
          <LinkError />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: 420 }} />}>
          <LoginForms />
        </Suspense>
      </div>
      <p className={s.foot}>
        New here?{" "}
        <Suspense fallback={<Link href="/signup">Join the community</Link>}>
          <SignupLink />
        </Suspense>
      </p>
    </div>
  );
}
