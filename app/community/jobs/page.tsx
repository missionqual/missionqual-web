import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CommunityNav } from "@/src/components/community/CommunityNav";
import s from "@/src/components/community/community.module.css";
import { FilterSelect } from "@/src/components/community/FilterSelect";
import { ExternalIcon } from "@/src/components/community/icons";
import j from "@/src/components/community/jobs.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { JOB_CATEGORIES, type JobCategory } from "@/src/lib/community/constants";
import { countWord, postedDate, weekOf } from "@/src/lib/community/format";
import { requireViewer } from "@/src/lib/community/viewer";
import { createClient } from "@/src/lib/supabase/server";

export const metadata: Metadata = { title: "Jobs This Week", robots: { index: false, follow: false } };

function href(role: string, state: string) {
  const q = new URLSearchParams();
  if (role) q.set("role", role);
  if (state) q.set("state", state);
  const qs = q.toString();
  return qs ? `/community/jobs?${qs}` : "/community/jobs";
}

async function Jobs({ searchParams }: { searchParams: PageProps<"/community/jobs">["searchParams"] }) {
  await requireViewer("/community/jobs");
  const sp = await searchParams;
  const role = typeof sp.role === "string" && sp.role in JOB_CATEGORIES ? (sp.role as JobCategory) : "";
  const supabase = await createClient();

  // Members see every active job (RLS); the public sees them a week later.
  const { data: all } = await supabase
    .from("jobs")
    .select("id, title, company, location, state, url, context, posted_at, category, created_at")
    .eq("active", true)
    .order("created_at", { ascending: false });
  const jobs = all ?? [];
  const states = [...new Set(jobs.map((x) => x.state).filter((x): x is string => Boolean(x)))].sort();
  const state = typeof sp.state === "string" && states.includes(sp.state) ? sp.state : "";
  const shown = jobs.filter((x) => (!role || x.category === role) && (!state || x.state === state));

  return (
    <div className={`${shared.wrap} ${s.page}`}>
      <div className={s.ph}>
        <div>
          <p className={s.kicker}>Week of {weekOf()}</p>
          <h1>Jobs This Week</h1>
          <p>
            {jobs.length ? `${countWord(jobs.length)} ${jobs.length === 1 ? "opening" : "openings"}` : "Openings"} picked
            for oil and gas backgrounds.
          </p>
        </div>
        {states.length > 0 && (
          <FilterSelect
            param="state"
            value={state}
            label="Filter by state"
            options={[{ value: "", label: "All states" }, ...states.map((x) => ({ value: x, label: x }))]}
            className={j.stateSel}
          />
        )}
      </div>

      <div className={s.chips} style={{ marginBottom: 24 }}>
        <Link className={`${s.chip} ${!role ? s.chipOn : ""}`} href={href("", state)} aria-current={!role || undefined}>
          All roles
        </Link>
        {(Object.keys(JOB_CATEGORIES) as JobCategory[]).map((c) => (
          <Link
            key={c}
            className={`${s.chip} ${role === c ? s.chipOn : ""}`}
            href={href(c, state)}
            aria-current={role === c || undefined}
          >
            {JOB_CATEGORIES[c]}
          </Link>
        ))}
      </div>

      {shown.length ? (
        <div className={j.grid}>
          {shown.map((job) => {
            const posted = postedDate(job.posted_at);
            return (
              <article key={job.id} className={s.job}>
                <div className={s.jm}>
                  <span>{job.state}</span>
                  {posted && <span>POSTED {posted}</span>}
                </div>
                <h3>{job.title}</h3>
                <p className={s.co}>{[job.company, job.location].filter(Boolean).join(" · ")}</p>
                {job.context && (
                  <p className={`${s.fit} ${j.fit}`}>
                    <b>Why it may fit:</b> {job.context}
                  </p>
                )}
                <div className={s.acts}>
                  {job.url && (
                    <a className={s.link} href={job.url} target="_blank" rel="noopener">
                      View posting <ExternalIcon />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                  <Link className={s.link} href={`/community/ask?job=${job.id}`}>
                    Ask about this job
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={s.empty}>
          <p>No jobs posted yet this week. New openings go up every Thursday.</p>
        </div>
      )}

      <div className={`${s.cardMuted} ${j.tip}`}>
        <div>
          <h2 className={s.ctitle}>Saw an opening we should share?</h2>
          <p className={s.meta} style={{ fontSize: ".95rem", marginTop: 4 }}>
            Post it in Questions with the tag Getting hired. The best ones make next week&rsquo;s list.
          </p>
        </div>
        <Link className={s.btn2} href="/community/ask">
          Share a job
        </Link>
      </div>
    </div>
  );
}

export default function JobsPage(props: PageProps<"/community/jobs">) {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
      <CommunityNav current="jobs" />
      <Jobs searchParams={props.searchParams} />
    </Suspense>
  );
}
