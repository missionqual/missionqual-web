import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import s from "@/src/components/jobs/jobs-page.module.css";
import { ArrowRight } from "@/src/components/landing/icons";
import { JobCard } from "@/src/components/landing/JobCard";
import j from "@/src/components/landing/Jobs.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { MembersOnly } from "@/src/components/resources/MembersOnly";
import { JOB_CATEGORIES, type JobCategory } from "@/src/lib/community/constants";
import { getViewer } from "@/src/lib/community/viewer";
import {
  formatPay,
  getActiveJobCount,
  getJobCountsByState,
  getLatestJobs,
  getPaySummary,
  type Job,
  type PaySummary,
} from "@/src/lib/jobs";
import { stateName } from "@/src/lib/projects";
import { pageMetadata } from "@/src/lib/seo";

// The public jobs page. Visitors can read only the 3 newest jobs (RLS), so the
// rest of the page uses what they're allowed to see in aggregate: open jobs per
// state and pay ranges per role. Members go straight to the full list.

const PATH = "/jobs";
const ALL_JOBS = "/community/jobs";
const TITLE = "Data center jobs for oil and gas QA/QC and trades";
const DESCRIPTION =
  "Data center construction jobs in QA/QC, commissioning, turnover and the trades, each with a note on why an oil and gas background fits.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

function warn(what: string, err: unknown) {
  console.warn(`${what} unavailable:`, err instanceof Error ? err.message : String(err));
}

export default async function JobsPage() {
  // Each failing falls back to empty; the join box still shows.
  const [jobs, total, byState, pay] = await Promise.all([
    getLatestJobs(3).catch((err): Job[] => {
      warn("Jobs", err);
      return [];
    }),
    getActiveJobCount().catch((err) => {
      warn("Job count", err);
      return 0;
    }),
    getJobCountsByState().catch((err) => {
      warn("Job counts by state", err);
      return [];
    }),
    getPaySummary().catch((err): PaySummary[] => {
      warn("Pay summary", err);
      return [];
    }),
  ]);

  const states = [...byState].sort((a, b) => b.jobs - a.jobs || stateName(a.state).localeCompare(stateName(b.state)));
  const most = states[0]?.jobs ?? 1;
  // Role order from JOB_CATEGORIES, hourly before yearly; roles with no pay data don't show.
  const payRows = (Object.keys(JOB_CATEGORIES) as JobCategory[]).flatMap((key) =>
    pay
      .filter((r) => r.category === key)
      .sort((a, b) => (a.pay_unit === "hour" ? -1 : 1) - (b.pay_unit === "hour" ? -1 : 1))
      .map((r) => ({ ...r, label: JOB_CATEGORIES[key] })),
  );

  return (
    <>
      <Suspense fallback={null}>
        <MembersToFullList />
      </Suspense>

      <section className={s.hero}>
        <div className={`${shared.wrap} ${s.heroInner}`}>
          <p className={s.kick}>Jobs</p>
          <h1>Data center jobs, picked for oil and gas backgrounds.</h1>
          <p className={s.sub}>
            Openings in QA/QC, commissioning, turnover and the trades, each with a note on why your experience fits.
          </p>
          {total > 0 && (
            <p className={s.stat}>
              <b>{total}</b> open {total === 1 ? "job" : "jobs"}
              {states.length > 0 && (
                <>
                  {" "}
                  across <b>{states.length}</b> {states.length === 1 ? "state" : "states"}
                </>
              )}
            </p>
          )}
        </div>
      </section>

      <div className={`${shared.wrap} ${s.page}`}>
        <section aria-labelledby="h-newest">
          <h2 id="h-newest" className={s.h2}>
            Newest openings
          </h2>
          {jobs.length > 0 ? (
            <div className={`${j.grid} ${s.grid}`}>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p className={s.lede}>New jobs go up every week.</p>
          )}
        </section>

        <div className={s.split}>
          {states.length > 0 && (
            <section className={s.panel} aria-labelledby="h-where">
              <h2 id="h-where" className={s.h2}>
                Where the jobs are
              </h2>
              <p className={s.lede}>Open jobs by state, across everything we&apos;ve posted.</p>
              <ul className={s.bars}>
                {states.map((st) => (
                  <li key={st.state}>
                    <span className={s.barLabel}>{stateName(st.state)}</span>
                    <span className={s.barTrack} aria-hidden="true">
                      <span className={s.barFill} style={{ width: `${(st.jobs / most) * 100}%` }} />
                    </span>
                    <span className={s.barNum}>{st.jobs}</span>
                  </li>
                ))}
              </ul>
              <Link href="/resources/where-data-centers-are-being-built" className={shared.linkArrow}>
                The major campuses in each state <ArrowRight width={14} height={11} />
              </Link>
            </section>
          )}

          {payRows.length > 0 && (
            <section className={s.panel} aria-labelledby="h-pay">
              <h2 id="h-pay" className={s.h2}>
                What they pay
              </h2>
              <p className={s.lede}>Ranges from the jobs we&apos;ve posted. A small sample that grows as we post.</p>
              <ul className={s.pay}>
                {payRows.map((r) => (
                  <li key={`${r.category}|${r.pay_unit}`}>
                    <span className={s.payRole}>{r.label}</span>
                    <b>{formatPay(r.low, r.high, r.pay_unit)}</b>
                    <span className={s.payN}>
                      from {r.postings} {r.postings === 1 ? "posting" : "postings"}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/resources/what-data-center-jobs-pay" className={shared.linkArrow}>
                How to read an offer <ArrowRight width={14} height={11} />
              </Link>
            </section>
          )}
        </div>

        <MembersOnly
          heading={total > jobs.length ? `You're seeing ${jobs.length} of ${total} jobs.` : "New jobs go up every week."}
          text="Members see every opening, by state and role, plus the Q&A and live sessions."
          path={ALL_JOBS}
          lock={false}
        >
          <Link href={ALL_JOBS} className={shared.linkArrow}>
            See all jobs <ArrowRight width={14} height={11} />
          </Link>
        </MembersOnly>
      </div>
    </>
  );
}

/** Members already see every job in the community, so send them there. */
async function MembersToFullList() {
  if (await getViewer()) redirect(ALL_JOBS);
  return null;
}
