import { cache } from "react";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { buttonClasses } from "./Button";

// Deduped per request: the header renders this for desktop and mobile.
const isSignedIn = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return Boolean(data?.claims);
});

const linkClass = "font-medium text-white/90 hover:text-white";

/** Reads the session, so render it inside <Suspense>. */
export async function AuthLinks({ layout }: { layout: "row" | "stack" }) {
  const signedIn = await isSignedIn();
  const wrapper =
    layout === "row" ? "flex items-center gap-5" : "flex flex-col items-start gap-4";

  if (signedIn) {
    return (
      <div className={wrapper}>
        <Link href="/account" className={linkClass}>
          Account
        </Link>
        {/* POST so the sign-out can't be triggered by a prefetch. */}
        <form action="/logout" method="post">
          <button type="submit" className={`${linkClass} cursor-pointer`}>
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <Link href="/login" className={linkClass}>
        Log in
      </Link>
      <Link href="/guide" className={buttonClasses("primary")}>
        Get the free guide
      </Link>
    </div>
  );
}
