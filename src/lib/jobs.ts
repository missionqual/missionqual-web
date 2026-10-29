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
 * Newest active jobs for the homepage. Anonymous client, so RLS returns only
 * the 3 newest (members see every job in the community). Cached rather than
 * read per request. Throws on error, so a failed fetch is never cached.
 */
export async function getLatestJobs(limit: number): Promise<Job[]> {
  "use cache";
  cacheLife("hours");

  const supabase = anonClient();

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

/**
 * Total active jobs, including the ones visitors can't see ("You're seeing 3
 * of N jobs."). Same cache rules as getLatestJobs: throws on error.
 */
export async function getActiveJobCount(): Promise<number> {
  "use cache";
  cacheLife("hours");

  const { data, error } = await anonClient().rpc("active_job_count");
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Open jobs per state, readable by visitors, so a page can say "4 open jobs
 * near this site" without showing the jobs. Same cache rules as getLatestJobs:
 * throws on error, so a failure is never cached.
 */
export async function getJobCountsByState(): Promise<{ state: string; jobs: number }[]> {
  "use cache";
  cacheLife("hours");

  const { data, error } = await anonClient().rpc("active_job_counts_by_state");
  if (error) throw new Error(error.message);
  return data;
}

function anonClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
