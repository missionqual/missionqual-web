import Link from "next/link";
import { cache, Suspense } from "react";
import { createClient } from "@/src/lib/supabase/server";

// Deduped per request: the header renders this for desktop and mobile.
const isSignedIn = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return Boolean(data?.claims);
});

async function SessionLink({ className }: { className: string }) {
  return (await isSignedIn()) ? (
    <Link href="/account" className={className}>
      Account
    </Link>
  ) : (
    <Link href="/login" className={className}>
      Sign in
    </Link>
  );
}

/** "Sign in", or "Account" when signed in. The static shell shows "Sign in". */
export function AccountLink({ className }: { className: string }) {
  return (
    <Suspense
      fallback={
        <Link href="/login" className={className}>
          Sign in
        </Link>
      }
    >
      <SessionLink className={className} />
    </Suspense>
  );
}
