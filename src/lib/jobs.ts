import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import type { Database } from "./supabase/database.types";

export type Job = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  state: string | null;
  url: string | null;
  /** Why an industrial background may fit this role. */
  context: string | null;
  posted_at: string | null;
};

/**
 * Newest active jobs for the homepage sample. Anonymous client, so it needs the
 * public read policy on jobs (members see the full list in the community).
 * Cached rather than read per request. Throws on error, so a failed fetch is
 * never cached.
 */
export async function getLatestJobs(limit: number): Promise<Job[]> {
  "use cache";
  cacheLife("hours");

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, company, location, state, url, context, posted_at")
    .eq("active", true)
    .order("posted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}
