import Link from "next/link";
import { Suspense } from "react";
import { getViewer } from "@/src/lib/community/viewer";
import { getLatestJobs, type Job } from "@/src/lib/jobs";
import { ArrowRight } from "./icons";
import { JobCard } from "./JobCard";
import s from "./Jobs.module.css";
import shared from "./shared.module.css";

const ALL_JOBS = "/community/jobs";

// The heading says "Recent" on purpose; only say "this week" if it truly updates weekly.
export async function Jobs() {
  let jobs: Job[] = [];
  try {
    jobs = await getLatestJobs(3);
  } catch (err) {
    // Same as "no jobs yet": the join box still shows.
    console.warn("Jobs unavailable:", err instanceof Error ? err.message : String(err));
  }

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
        <Suspense fallback={<JoinBox hasJobs={jobs.length > 0} />}>
          <AllJobs hasJobs={jobs.length > 0} />
        </Suspense>
      </div>
    </section>
  );
}

async function AllJobs({ hasJobs }: { hasJobs: boolean }) {
  if (!(await getViewer())) return <JoinBox hasJobs={hasJobs} />;
  return (
    <Link href={ALL_JOBS} className={`${shared.linkArrow} ${s.allLink}`}>
      See all jobs <ArrowRight width={14} height={11} />
    </Link>
  );
}

/** Says the full list is for members before anyone clicks through to it. */
function JoinBox({ hasJobs }: { hasJobs: boolean }) {
  const back = encodeURIComponent(ALL_JOBS);
  return (
    <div className={s.join}>
      <div className={s.joinText}>
        <h3>{hasJobs ? "Want to see all the jobs?" : "See the jobs we've picked"}</h3>
        <p>The full list is for community members, along with the Q&amp;A and live sessions.</p>
      </div>
      <div className={s.joinActs}>
        <Link href={`/signup?next=${back}`} className={s.joinBtn}>
          Join the community to see all jobs <ArrowRight width={14} height={11} />
        </Link>
        <p className={s.signin}>
          Already a member? <Link href={`/login?next=${back}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
