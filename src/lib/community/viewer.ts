import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/src/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string | null;
  name: string;
  profile: {
    display_name: string | null;
    job_title: string | null;
    dc_status: string | null;
    years_experience: number | null;
    certifications: string[] | null;
    disciplines: string[] | null;
    location: string | null;
    about: string | null;
  } | null;
};

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
    .select("display_name, job_title, dc_status, years_experience, certifications, disciplines, location, about")
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
