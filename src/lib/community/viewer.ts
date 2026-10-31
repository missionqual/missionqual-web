import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/src/lib/supabase/server";
import { REQUIRED_PROFILE_FIELDS, requiredFilled } from "./format";

export type Viewer = {
  id: string;
  email: string | null;
  name: string;
  profile: {
    display_name: string | null;
    job_title: string | null;
    industry: string | null;
    dc_status: string | null;
    years_experience: number | null;
    certifications: string[] | null;
    location: string | null;
    about: string | null;
  } | null;
};

const PROFILE_COLUMNS = "display_name, job_title, industry, dc_status, years_experience, certifications, location, about";

/**
 * The signed-in member for this request, or null. Deduped per request. Reads
 * the session, so callers in Server Components need a <Suspense> boundary.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", claims.sub)
    .maybeSingle();

  const metaName = (claims.user_metadata as { display_name?: string } | undefined)?.display_name;
  return {
    id: claims.sub,
    email: (claims.email as string | undefined) ?? null,
    name: profile?.display_name || metaName || "Member",
    profile,
  };
});

/**
 * Where to send a member right after they confirm their email or sign in:
 * /welcome while any required profile field is empty, otherwise /community.
 * An explicit destination (e.g. /community/ask) wins, after /welcome if needed.
 */
export async function landingPath(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  next: string | null,
) {
  const { data: profile } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle();
  // The old defaults (/account, /account?welcome=1) and /welcome itself aren't a real choice.
  const explicit = next && !next.startsWith("/account") && !next.startsWith("/welcome") ? next : null;
  if (!profile || requiredFilled(profile) < REQUIRED_PROFILE_FIELDS) {
    return explicit ? `/welcome?next=${encodeURIComponent(explicit)}` : "/welcome";
  }
  return explicit ?? "/community";
}

/** For members-only pages: the viewer, or a redirect to sign in that comes back here. */
export async function requireViewer(path: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(path)}`);
  return viewer;
}

/** Moderators have a row in public.moderators; RLS lets a member read only their own. */
export const isModerator = cache(async () => {
  const viewer = await getViewer();
  if (!viewer) return false;
  const supabase = await createClient();
  const { data } = await supabase.from("moderators").select("user_id").eq("user_id", viewer.id).maybeSingle();
  return Boolean(data);
});

/** The request's clock, read once per request (pages are dynamic: they read the session). */
export const requestTime = cache(() => Date.now());
