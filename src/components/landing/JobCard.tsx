import type { LandingJob } from "@/src/lib/placeholder-jobs";
import { ArrowUpRight } from "./icons";
import s from "./Jobs.module.css";
import shared from "./shared.module.css";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function JobCard({ job }: { job: LandingJob }) {
  // Real postings are external and open in a new tab.
  const external = /^https?:\/\//.test(job.url);

  return (
    <article className={s.jcard}>
      <div className={s.meta}>
        <span>{job.state}</span>
        <time dateTime={job.postedAt}>Posted {dateFormat.format(new Date(job.postedAt))}</time>
      </div>
      <h3>{job.title}</h3>
      <div className={s.co}>
        {job.company} · {job.city}
      </div>
      <div className={s.fit}>
        <b>Why it may fit:</b> {job.fit}
      </div>
      <a
        href={job.url}
        className={shared.linkArrow}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        View posting <ArrowUpRight />
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    </article>
  );
}
