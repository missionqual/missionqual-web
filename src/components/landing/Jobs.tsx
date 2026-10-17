import Link from "next/link";
import { PLACEHOLDER_JOBS } from "@/src/lib/placeholder-jobs";
import { ArrowRight } from "./icons";
import { JobCard } from "./JobCard";
import s from "./Jobs.module.css";
import shared from "./shared.module.css";

// TODO: replace the placeholders with the 3 newest real postings (title,
// company, city, real posted date, one honest "why it may fit" line). The
// heading says "Recent" on purpose — only say "this week" if it truly updates weekly.
const JOBS = PLACEHOLDER_JOBS.slice(0, 3);

export function Jobs() {
  return (
    <section className={`${s.jobs} ${shared.section}`} id="jobs">
      <div className={`${shared.wrap} ${s.inner}`}>
        <div className={s.head}>
          <h2 className={`${shared.h2} ${s.h2}`}>Recent data center jobs</h2>
          <Link href="/jobs" className={shared.linkArrow}>
            See all jobs <ArrowRight width={14} height={11} />
          </Link>
        </div>
        <p className={shared.lede}>Curated, with a note on why an industrial background may fit.</p>
        <div className={s.grid}>
          {JOBS.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
