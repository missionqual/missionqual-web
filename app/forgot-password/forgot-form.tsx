"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import s from "@/src/components/auth/auth.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { requestPasswordReset } from "./actions";

export function ForgotForm() {
  const searchParams = useSearchParams();
  const [state, action, pending] = useActionState(requestPasswordReset, {});

  if (state.message) {
    return (
      <div className={s.form}>
        <p role="status" className={s.status}>
          {state.message}
        </p>
        <p className={s.small}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <form action={action} className={s.form}>
      {searchParams.get("error") === "link_invalid" && (
        <p role="alert" className={s.error}>
          That reset link is invalid or has expired. Ask for a new one below.
        </p>
      )}
      <div>
        <label className={s.label} htmlFor="forgot-email">
          Email
        </label>
        <input id="forgot-email" className={s.input} name="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@email.com" />
      </div>
      {state.error && (
        <p role="alert" className={s.error}>
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${shared.btn} ${s.submit}`}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
