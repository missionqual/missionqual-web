import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LinkError } from "./link-error";
import { LoginForms } from "./login-forms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
      <Suspense fallback={null}>
        <LinkError />
      </Suspense>
      <LoginForms />
      <p className="mt-8 text-sm">
        No account? <Link href="/signup" className="underline">Sign up</Link>
      </p>
    </main>
  );
}
