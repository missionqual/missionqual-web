import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProfileForm, type Profile } from "@/app/account/profile-form";
import o from "@/src/components/community/onboarding.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { firstName, safeNext } from "@/src/lib/community/format";
import { createClient } from "@/src/lib/supabase/server";

export const metadata: Metadata = { title: "Set up your profile", robots: { index: false, follow: false } };

/** Profile setup right after signup (design/onboarding/profile-setup.html). */
export default function WelcomePage(props: PageProps<"/welcome">) {
  return (
    <main className={o.page}>
      <div className={shared.wrap}>
        {/* The session is read at request time, so it streams in behind Suspense. */}
        <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
          <Welcome searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Welcome({ searchParams }: { searchParams: PageProps<"/welcome">["searchParams"] }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) redirect("/login?next=/welcome");

  // Where "Enter the community" and "Skip for now" go: the page they signed up from, or the community home.
  const next = safeNext((await searchParams).next, "");
  const dest = next || "/community?welcome=1";

  const { data: row } = await supabase
    .from("profiles")
    .select("display_name, job_title, industry, dc_status, location, years_experience, certifications, about, email_on_reply")
    .eq("id", claims.sub)
    .maybeSingle();

  // No row yet (signed up with email confirmation on): prefill the name from signup.
  const metaName = (claims.user_metadata?.display_name as string | undefined) ?? null;
  const profile: Profile = row
    ? { ...row, display_name: row.display_name || metaName }
    : {
        display_name: metaName,
        job_title: null,
        industry: null,
        dc_status: null,
        location: null,
        years_experience: null,
        certifications: null,
        about: null,
        email_on_reply: true,
      };

  return (
    <>
      <div className={o.card}>
        <ProfileForm mode="welcome" profile={profile} firstName={firstName(profile.display_name)} dest={dest} />
      </div>
      <p className={o.note}>Your profile is only visible to signed-in members. Your email is never shown.</p>
    </>
  );
}
