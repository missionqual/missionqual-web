import Link from "next/link";
import { getLatestJobs } from "@/src/lib/jobs";
import { ArrowRight } from "./icons";
import { JobCard } from "./JobCard";
import s from "./Jobs.module.css";
import shared from "./shared.module.css";

// The heading says "Recent" on purpose; only say "this week" if it truly updates weekly.
export async function Jobs() {
  // Anonymous query: RLS only returns jobs added 7+ days ago (members see them first).
  const jobs = await getLatestJobs(3);

  return (
    <section className={`${s.jobs} ${shared.section}`} id="jobs">
      <div className={`${shared.wrap} ${s.inner}`}>
        <div className={s.head}>
          <h2 className={`${shared.h2} ${s.h2}`}>Recent data center jobs</h2>
          <Link href="/jobs" className={shared.linkArrow}>
            See all jobs <ArrowRight width={14} height={11} />
          </Link>
        </div>
        {jobs.length ? (
          <>
            <p className={shared.lede}>Curated, with a note on why an industrial background may fit.</p>
            <div className={s.grid}>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </>
        ) : (
          <p className={shared.lede}>
            New openings go to members first.{" "}
            <Link href="/community" className={s.membersLink}>
              Join the community to see this week&rsquo;s jobs.
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
