"use client";

import { useActionState } from "react";
import { signup } from "./actions";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, {});

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        Display name
        <input name="display_name" required autoComplete="name" className="border px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        Email
        <input name="email" type="email" required autoComplete="email" className="border px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        Password
        <input name="password" type="password" required minLength={6} autoComplete="new-password" className="border px-2 py-1" />
      </label>
      {state.error && <p role="alert" className="text-red-600">{state.error}</p>}
      {state.message && <p role="status" className="text-green-700">{state.message}</p>}
      <button type="submit" disabled={pending} className="border px-3 py-1">
        {pending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
