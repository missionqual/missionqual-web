import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/src/components/community/bits";
import { firstName } from "@/src/lib/community/format";
import { getViewer, isModerator } from "@/src/lib/community/viewer";
import { createAdminClient } from "@/src/lib/supabase/admin";
import s from "./Header.module.css";

type Variant = "text" | "avatar";

/** Open reports, for the "Moderation (n)" header link. Only called after isModerator(). */
async function openReports() {
  const { count } = await createAdminClient()
    .from("reports")
    .select("id", { count: "exact", head: true })
    .is("resolved_at", null);
  return count ?? 0;
}

async function SessionLink({ className, variant }: { className: string; variant: Variant }) {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <Link href="/login" className={className}>
        Sign in
      </Link>
    );
  }
  if (variant === "text") {
    return (
      <Link href="/account" className={className}>
        Your profile
      </Link>
    );
  }
  const reports = (await isModerator()) ? await openReports() : 0;
  return (
    <>
      {reports > 0 && (
        <Link href="/community/moderation" className={className}>
          Moderation ({reports})
        </Link>
      )}
      <Link href="/account" className={`${className} ${s.me}`} aria-label={`Your profile (${viewer.name})`}>
        <Avatar name={viewer.name} size="sm" teal />
        {firstName(viewer.name)}
      </Link>
    </>
  );
}

/**
 * "Sign in" for visitors. Signed in: the header shows an initials avatar plus
 * first name (variant "avatar"); the footer sitemap shows "Your profile".
 * The static shell links to /login.
 */
export function AccountLink({ className, variant = "text" }: { className: string; variant?: Variant }) {
  return (
    <Suspense
      fallback={
        <Link href="/login" className={className}>
          Sign in
        </Link>
      }
    >
      <SessionLink className={className} variant={variant} />
    </Suspense>
  );
}

/** "Get the guide" in the header; members don't see it anywhere under /community. */
export function GuideSlot({ children, member }: { children: React.ReactNode; member: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <GuideSlotInner member={member}>{children}</GuideSlotInner>
    </Suspense>
  );
}

async function GuideSlotInner({ children, member }: { children: React.ReactNode; member: React.ReactNode }) {
  return (await getViewer()) ? member : children;
}
