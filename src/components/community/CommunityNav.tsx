import Link from "next/link";
import shared from "@/src/components/landing/shared.module.css";
import { createClient } from "@/src/lib/supabase/server";
import s from "./community.module.css";
import { PlusIcon } from "./icons";

export type CommunityTab = "questions" | "jobs" | "sessions" | "members" | null;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Jobs added in the last 7 days, for the "N new" badge on the Jobs tab. */
async function newJobsCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("active", true)
    .gte("created_at", new Date(Date.now() - WEEK_MS).toISOString());
  return count ?? 0;
}

/** White sub-nav under the site header on member pages (design/community/*.html). */
export async function CommunityNav({ current }: { current: CommunityTab }) {
  const fresh = await newJobsCount();
  const tab = (key: CommunityTab) => ({
    className: `${s.tab} ${current === key ? s.tabOn : ""}`,
    "aria-current": current === key ? ("page" as const) : undefined,
  });

  return (
    <div className={s.sub}>
      <div className={`${shared.wrap} ${s.subInner}`}>
        <nav className={s.tabs} aria-label="Community">
          <Link href="/community" {...tab("questions")}>
            Questions
          </Link>
          <Link href="/community/jobs" {...tab("jobs")}>
            <span className={s.dk}>Jobs This Week</span>
            <span className={s.mb}>Jobs</span>
            {fresh > 0 && <span className={s.cnt}>{fresh} new</span>}
          </Link>
          <Link href="/community/sessions" {...tab("sessions")}>
            <span className={s.dk}>Live sessions</span>
            <span className={s.mb}>Sessions</span>
          </Link>
          <Link href="/community/members" {...tab("members")}>
            Members
          </Link>
        </nav>
        <Link href="/community/ask" className={`${shared.btn} ${shared.btnSm} ${s.subAsk}`}>
          <PlusIcon /> Ask a question
        </Link>
      </div>
    </div>
  );
}
