"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import s from "@/src/components/auth/auth.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { safeNext } from "@/src/lib/community/format";
import { loginWithPassword, sendMagicLink, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export function LoginForms() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"), "/account");
  const [pwState, pwAction, pwPending] = useActionState(loginWithPassword, initialState);
  const [mlState, mlAction, mlPending] = useActionState(sendMagicLink, initialState);

  return (
    <>
      <form action={pwAction} className={s.form}>
        <input type="hidden" name="next" value={next} />
        <div>
          <label className={s.label} htmlFor="login-email">
            Email
          </label>
          <input id="login-email" className={s.input} name="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@email.com" />
        </div>
        <div>
          <label className={s.label} htmlFor="login-password">
            Password
          </label>
          <input id="login-password" className={s.input} name="password" type="password" required autoComplete="current-password" />
        </div>
        {pwState.error && (
          <p role="alert" className={s.error}>
            {pwState.error}
          </p>
        )}
        <button type="submit" disabled={pwPending} className={`${shared.btn} ${s.submit}`}>
          {pwPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className={s.divider}>or get a one-time sign-in link</p>
      <form action={mlAction} className={s.form} style={{ marginTop: 16 }}>
        <input type="hidden" name="next" value={next} />
        <div>
          <label className={s.label} htmlFor="magic-email">
            Email
          </label>
          <input id="magic-email" className={s.input} name="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@email.com" />
        </div>
        {mlState.error && (
          <p role="alert" className={s.error}>
            {mlState.error}
          </p>
        )}
        {mlState.message && (
          <p role="status" className={s.status}>
            {mlState.message}
          </p>
        )}
        <button type="submit" disabled={mlPending} className={`${shared.btn} ${s.submit}`}>
          {mlPending ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>
    </>
  );
}

/** "No account?" link that keeps ?next= so new members land back where they were. */
export function SignupLink() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"), "");
  return (
    <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}>Join the community</Link>
  );
}
