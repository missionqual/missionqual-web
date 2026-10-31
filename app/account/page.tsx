import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { Suspense } from "react";
import s from "@/src/components/auth/auth.module.css";
import o from "@/src/components/community/onboarding.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { syncCommunityMember } from "@/src/lib/community/sync";
import { createClient } from "@/src/lib/supabase/server";
import { ProfileForm, type Profile } from "./profile-form";

export const metadata: Metadata = { title: "Edit profile", robots: { index: false, follow: false } };

export default function AccountPage() {
  return (
    <main className={o.page}>
      <div className={shared.wrap}>
        {/* The session is read at request time, so it streams in behind Suspense. */}
        <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
          <Account />
        </Suspense>
      </div>
    </main>
  );
}

async function Account() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) redirect("/login?next=/account");

  const { data: row, error } = await supabase
    .from("profiles")
    .select(
      "display_name, job_title, industry, dc_status, location, years_experience, certifications, about, email_on_reply, mailerlite_synced",
    )
    .eq("id", claims.sub)
    .maybeSingle();

  if (error) {
    return (
      <div className={s.card}>
        <p role="alert" className={s.error}>
          Couldn&rsquo;t load your profile. Refresh to try again.
        </p>
      </div>
    );
  }

  // Retry a MailerLite community sync that failed at signup or confirm. after()
  // can't read cookies here, so it gets plain values captured during the request.
  if (row && !row.mailerlite_synced && claims.email) {
    const target = {
      userId: claims.sub,
      email: claims.email,
      name: row.display_name ?? (claims.user_metadata?.display_name as string | undefined) ?? "",
    };
    after(() => syncCommunityMember(target));
  }

  // No row yet (e.g. signed up with email confirmation on): seed from signup metadata.
  const profile: Profile = row ?? {
    display_name: (claims.user_metadata?.display_name as string | undefined) ?? null,
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
        <ProfileForm mode="edit" profile={profile} email={claims.email ?? null} memberId={claims.sub} />
      </div>
      <div className={s.signout}>
        <span>Done for now?</span>
        <form action="/logout" method="post">
          <button type="submit" className="cursor-pointer font-semibold text-[var(--teal-dark)]">
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
