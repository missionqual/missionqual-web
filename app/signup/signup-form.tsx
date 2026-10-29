"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import s from "@/src/components/auth/auth.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { safeNext } from "@/src/lib/community/format";
import { signup } from "./actions";

export function SignupForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"), "/account?welcome=1");
  const [state, action, pending] = useActionState(signup, {});

  return (
    <form action={action} className={s.form}>
      <input type="hidden" name="next" value={next} />
      <div>
        <label className={s.label} htmlFor="signup-name">
          Full name
        </label>
        <input id="signup-name" className={s.input} name="display_name" required autoComplete="name" />
      </div>
      <div>
        <label className={s.label} htmlFor="signup-email">
          Email
        </label>
        <input id="signup-email" className={s.input} name="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@email.com" />
      </div>
      <div>
        <label className={s.label} htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          className={s.input}
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-describedby="signup-password-help"
        />
        <p id="signup-password-help" className={s.help}>
          At least 8 characters.
        </p>
      </div>
      {state.error && (
        <p role="alert" className={s.error}>
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className={s.status}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${shared.btn} ${s.submit}`}>
        {pending ? "Creating your account…" : "Join the community"}
      </button>
      <p className={s.small}>
        By joining, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </form>
  );
}
