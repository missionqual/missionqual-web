"use client";

import { useActionState } from "react";
import {
  loginWithPassword,
  sendMagicLink,
  type AuthFormState,
} from "./actions";

const initialState: AuthFormState = {};

export function LoginForms() {
  const [pwState, pwAction, pwPending] = useActionState(
    loginWithPassword,
    initialState,
  );
  const [mlState, mlAction, mlPending] = useActionState(
    sendMagicLink,
    initialState,
  );

  return (
    <div className="flex flex-col gap-8">
      <form action={pwAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          Email
          <input name="email" type="email" required autoComplete="email" className="border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="border px-2 py-1" />
        </label>
        {pwState.error && <p role="alert" className="text-red-600">{pwState.error}</p>}
        <button type="submit" disabled={pwPending} className="border px-3 py-1">
          {pwPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <form action={mlAction} className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">Or get a one-time sign-in link by email:</p>
        <label className="flex flex-col gap-1">
          Email
          <input name="email" type="email" required autoComplete="email" className="border px-2 py-1" />
        </label>
        {mlState.error && <p role="alert" className="text-red-600">{mlState.error}</p>}
        {mlState.message && <p role="status" className="text-green-700">{mlState.message}</p>}
        <button type="submit" disabled={mlPending} className="border px-3 py-1">
          {mlPending ? "Sending…" : "Email me a magic link"}
        </button>
      </form>
    </div>
  );
}
