import type { Job } from "@/src/lib/jobs";
import { ArrowUpRight } from "./icons";
import s from "./Jobs.module.css";
import shared from "./shared.module.css";

// posted_at is a calendar date, so format it in UTC.
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function JobCard({ job }: { job: Job }) {
  // Real postings are external and open in a new tab.
  const external = Boolean(job.url && /^https?:\/\//.test(job.url));

  return (
    <article className={s.jcard}>
      <div className={s.meta}>
        <span>{job.state}</span>
        {job.posted_at && (
          <time dateTime={job.posted_at}>Posted {dateFormat.format(new Date(job.posted_at))}</time>
        )}
      </div>
      <h3>{job.title}</h3>
      <div className={s.co}>{[job.company, job.location].filter(Boolean).join(" · ")}</div>
      {/* context already reads as the fit line (sometimes ending with the pay). */}
      {job.context && (
        <div className={s.fit}>
          <b>Why it may fit:</b> {job.context}
        </div>
      )}
      {job.url && (
        <a
          href={job.url}
          className={shared.linkArrow}
          {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        >
          View posting <ArrowUpRight />
          {external && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
      )}
    </article>
  );
}
