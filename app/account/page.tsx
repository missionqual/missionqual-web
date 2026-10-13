import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { ProfileForm, type Profile } from "./profile-form";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Your account</h1>
      {/* The session is read at request time, so it streams in behind Suspense. */}
      <Suspense fallback={<p>Loading your profile…</p>}>
        <Account />
      </Suspense>
      <form action="/logout" method="post" className="mt-8">
        <button type="submit" className="border px-3 py-1">Sign out</button>
      </form>
    </main>
  );
}

async function Account() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) redirect("/login");

  const { data: row, error } = await supabase
    .from("profiles")
    .select(
      "display_name, job_title, industry, years_experience, certifications, disciplines, career_intent, location",
    )
    .eq("id", claims.sub)
    .maybeSingle();

  if (error) {
    return <p role="alert" className="text-red-600">Couldn’t load your profile: {error.message}</p>;
  }

  // No row yet (e.g. signed up with email confirmation on): seed from signup metadata.
  const profile: Profile = row ?? {
    display_name: (claims.user_metadata?.display_name as string | undefined) ?? null,
    job_title: null,
    industry: null,
    years_experience: null,
    certifications: null,
    disciplines: null,
    career_intent: null,
    location: null,
  };

  return (
    <>
      <p className="mb-6 text-sm text-gray-600">Signed in as {claims.email}</p>
      {!row && (
        <p className="mb-4 text-sm">You haven’t saved a profile yet. Fill it in below.</p>
      )}
      <ProfileForm profile={profile} />
    </>
  );
}
