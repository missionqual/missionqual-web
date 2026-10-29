import Link from "next/link";
import { Suspense } from "react";
import { getViewer } from "@/src/lib/community/viewer";
import { getActiveJobCount, getLatestJobs, type Job } from "@/src/lib/jobs";
import { ArrowRight } from "./icons";
import { JobCard } from "./JobCard";
import s from "./Jobs.module.css";
import shared from "./shared.module.css";

const ALL_JOBS = "/community/jobs";

// The heading says "Recent" on purpose; only say "this week" if it truly updates weekly.
export async function Jobs() {
  // Either failing falls back to "no jobs yet": the join box still shows.
  const [jobs, total] = await Promise.all([
    getLatestJobs(3).catch((err): Job[] => {
      console.warn("Jobs unavailable:", err instanceof Error ? err.message : String(err));
      return [];
    }),
    getActiveJobCount().catch((err) => {
      console.warn("Job count unavailable:", err instanceof Error ? err.message : String(err));
      return 0;
    }),
  ]);

  return (
    <section className={`${s.jobs} ${shared.section}`} id="jobs">
      <div className={`${shared.wrap} ${s.inner}`}>
        <h2 className={`${shared.h2} ${s.h2}`}>Recent data center jobs</h2>
        {jobs.length > 0 && (
          <>
            <p className={shared.lede}>Curated, with a note on why an industrial background may fit.</p>
            <div className={s.grid}>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </>
        )}
        {/* Visitors see the join box in the static shell; members get a plain link. */}
        <Suspense fallback={<JoinBox total={total} />}>
          <AllJobs total={total} />
        </Suspense>
      </div>
    </section>
  );
}

async function AllJobs({ total }: { total: number }) {
  if (!(await getViewer())) return <JoinBox total={total} />;
  return (
    <Link href={ALL_JOBS} className={`${shared.linkArrow} ${s.allLink}`}>
      See all jobs <ArrowRight width={14} height={11} />
    </Link>
  );
}

/** Says the full list is for members before anyone clicks through to it. */
function JoinBox({ total }: { total: number }) {
  const back = encodeURIComponent(ALL_JOBS);
  const more = total > 3;
  return (
    <div className={s.join}>
      <div className={s.joinText}>
        <h3>{more ? `You're seeing 3 of ${total} jobs.` : "New jobs go up every week."}</h3>
        <p>
          {more
            ? "The full list is in the community, each job with a note on why your background fits, plus the Q&A and live sessions."
            : "Members get every opening we post, plus the Q&A and live sessions."}
        </p>
      </div>
      <div className={s.joinActs}>
        <Link href={`/signup?next=${back}`} className={s.joinBtn}>
          Join the community <ArrowRight width={14} height={11} />
        </Link>
        <p className={s.signin}>
          Already a member? <Link href={`/login?next=${back}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
