import Link from "next/link";
import { JobCard } from "@/src/components/landing/JobCard";
import { ArrowRight } from "@/src/components/landing/icons";
import shared from "@/src/components/landing/shared.module.css";
import {
  formatPay,
  getActiveJobCount,
  getLatestJobs,
  getPublicJobsWithPay,
  type Job,
  type JobWithPay,
} from "@/src/lib/jobs";
import { stateName } from "@/src/lib/projects";
import type { ArticleMeta } from "@/src/lib/resources";
import { createClient } from "@/src/lib/supabase/server";
import a from "./article.module.css";
import { CommunityBox } from "./CommunityBox";
import { MembersOnly } from "./MembersOnly";

function warn(what: string, err: unknown) {
  console.warn(`${what} unavailable:`, err instanceof Error ? err.message : String(err));
}

/** Section headings of the in-article calls to action, also listed in "On this page". */
export const END_CTA_HEADINGS = {
  jobs: "Jobs near these sites",
  pay: "Postings behind these numbers",
} as const;

/**
 * The article's one call to action, chosen by meta.endCta. "jobs" and "pay"
 * sit in the article column right after the body; "interview" has none
 * (InterviewQuestions ends with the only join box). Unset, the community box
 * goes at the very bottom of the page instead (see the article page).
 */
export function EndCta({ kind, path }: { kind: ArticleMeta["endCta"]; path: string }) {
  if (kind === "jobs") return <JobsCta path={path} />;
  if (kind === "pay") return <PayCta path={path} />;
  return null;
}

/** For articles without endCta: the bottom-of-page community box. */
export function EndCommunityBox({ path }: { path: string }) {
  return (
    <CommunityBox
      title="Questions about this? Ask the people already doing it."
      text="Members answer in the community."
      back={path}
    />
  );
}

async function JobsCta({ path }: { path: string }) {
  const [jobs, total] = await Promise.all([
    getLatestJobs(3).catch((err): Job[] => {
      warn("Jobs", err);
      return [];
    }),
    getActiveJobCount().catch((err) => {
      warn("Job count", err);
      return 0;
    }),
  ]);
  const more = total > jobs.length;

  return (
    <section className={a.end} aria-labelledby="h-end">
      <h2 id="h-end">{END_CTA_HEADINGS.jobs}</h2>
      {jobs.length > 0 && (
        <>
          <p className={a.endLede}>
            The {jobs.length} newest openings we&apos;ve posted, each with a note on why an oil and gas background fits.
          </p>
          <div className={a.jgrid}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      )}
      <MembersOnly
        heading={more ? `You're seeing ${jobs.length} of ${total} jobs.` : "New jobs go up every week."}
        text="Members see every opening near these sites, plus the Q&A and live sessions."
        path={path}
        lock={false}
      >
        <Link href="/community/jobs" className={`${shared.linkArrow} ${a.allJobs}`}>
          See all jobs <ArrowRight width={14} height={11} />
        </Link>
      </MembersOnly>
    </section>
  );
}

async function PayCta({ path }: { path: string }) {
  const jobs = await getPublicJobsWithPay(3).catch((err): JobWithPay[] => {
    warn("Jobs with pay", err);
    return [];
  });

  return (
    <section className={a.end} aria-labelledby="h-end">
      <h2 id="h-end">{END_CTA_HEADINGS.pay}</h2>
      <MembersOnly
        heading="Members see every posting with pay, ranges by state, and can post an offer for a check."
        text={null}
        path={path}
        lock={false}
        teaser={
          jobs.length > 0 && (
            <div className={a.jgrid}>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} pay={formatPay(job.pay_min, job.pay_max, job.pay_unit)} />
              ))}
            </div>
          )
        }
      >
        <MemberPayTable />
      </MembersOnly>
    </section>
  );
}

/** Members only (rendered inside MembersOnly): every active job with pay, grouped by state. */
async function MemberPayTable() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, company, state, pay_min, pay_max, pay_unit, per_diem_day")
    .eq("active", true)
    .not("pay_min", "is", null)
    .order("state")
    .order("pay_min", { ascending: false });
  const jobs = (data ?? []).filter((j): j is typeof j & { pay_min: number } => j.pay_min !== null);
  if (!jobs.length) return <p className={a.endLede}>No postings with pay yet.</p>;

  const states = [...new Set(jobs.map((j) => j.state ?? "—"))].sort((x, y) => stateName(x).localeCompare(stateName(y)));

  return (
    <div className={a.tbl} role="region" aria-label="Every posting with pay" tabIndex={0}>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Company</th>
            <th>State</th>
            <th>Pay</th>
            <th>Per diem</th>
          </tr>
        </thead>
        {states.map((st) => (
          <tbody key={st}>
            <tr className={a.stateRow}>
              <td colSpan={5}>{stateName(st)}</td>
            </tr>
            {jobs
              .filter((j) => (j.state ?? "—") === st)
              .map((j) => (
                <tr key={j.id}>
                  <td>{j.title}</td>
                  <td>{j.company ?? "—"}</td>
                  <td>{j.state ?? "—"}</td>
                  <td className={a.num}>{formatPay(j.pay_min, j.pay_max, j.pay_unit)}</td>
                  <td className={a.num}>{j.per_diem_day ? `$${j.per_diem_day}/day` : "—"}</td>
                </tr>
              ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
