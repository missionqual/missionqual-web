"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import s from "@/src/components/auth/auth.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { safeNext } from "@/src/lib/community/format";
import { loginWithPassword, resendConfirmation, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export function LoginForms() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"), "/account");
  const [pwState, pwAction, pwPending] = useActionState(loginWithPassword, initialState);

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
          <p className={s.forgot}>
            <Link href="/forgot-password">Forgot password?</Link>
          </p>
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

      {pwState.unconfirmedEmail && <Unconfirmed key={pwState.unconfirmedEmail} email={pwState.unconfirmedEmail} />}
    </>
  );
}

/** Sign-in failed because the address isn't confirmed yet: offer a fresh link. */
function Unconfirmed({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendConfirmation, initialState);
  return (
    <form action={action} className={s.notice}>
      <input type="hidden" name="email" value={email} />
      <p role="alert">
        Confirm your email first. We sent a link to <b>{email}</b>. Check your spam folder too.
      </p>
      <button type="submit" disabled={pending} className={`${shared.btn} ${s.submit}`}>
        {pending ? "Sending…" : "Resend the link"}
      </button>
      {state.error && <p className={s.error}>{state.error}</p>}
      {state.message && (
        <p role="status" className={s.status}>
          {state.message}
        </p>
      )}
    </form>
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
