"use client";

import { useActionState } from "react";
import s from "@/src/components/auth/auth.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { resetPassword } from "./actions";

export function ResetForm() {
  const [state, action, pending] = useActionState(resetPassword, {});

  return (
    <form action={action} className={s.form}>
      <div>
        <label className={s.label} htmlFor="reset-password">
          New password
        </label>
        <input id="reset-password" className={s.input} name="password" type="password" required minLength={8} autoComplete="new-password" aria-describedby="reset-help" />
        <p id="reset-help" className={s.help}>
          At least 8 characters.
        </p>
      </div>
      <div>
        <label className={s.label} htmlFor="reset-confirm">
          Confirm new password
        </label>
        <input id="reset-confirm" className={s.input} name="confirm" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {state.error && (
        <p role="alert" className={s.error}>
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${shared.btn} ${s.submit}`}>
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
