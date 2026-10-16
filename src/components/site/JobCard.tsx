import type { Job } from "@/src/lib/jobs";

export type JobCardData = {
  id: string;
  state: string | null;
  /** Shown top right, e.g. "OCT 14". */
  postedLabel: string | null;
  /** ISO date for the <time> element, when known. */
  postedAt?: string;
  title: string;
  companyLine: string;
  fit: string | null;
  url: string;
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function toJobCardData(job: Job): JobCardData {
  return {
    id: job.id,
    state: job.state,
    postedLabel: job.posted_at ? dateFormat.format(new Date(job.posted_at)).toUpperCase() : null,
    postedAt: job.posted_at ?? undefined,
    title: job.title,
    companyLine: [job.company, job.location].filter(Boolean).join(" · "),
    fit: job.context,
    url: job.url,
  };
}

export function JobCard({ job }: { job: JobCardData }) {
  // Real postings are external and open in a new tab.
  const external = /^https?:\/\//.test(job.url);

  return (
    <article className="flex flex-col gap-3 rounded-md border border-line bg-white p-6">
      <div className="flex justify-between gap-2 font-mono text-xs tracking-[0.08em] text-muted">
        <span>{job.state}</span>
        {job.postedLabel &&
          (job.postedAt ? (
            <time dateTime={job.postedAt}>{job.postedLabel}</time>
          ) : (
            <span>{job.postedLabel}</span>
          ))}
      </div>
      <h3 className="text-lg font-semibold leading-[1.35] text-navy">{job.title}</h3>
      <p className="text-[15px] text-body">{job.companyLine}</p>
      {job.fit && (
        <p className="rounded-[4px] bg-fit px-3.5 py-3 text-sm leading-normal text-navy">
          <span className="font-semibold">Why it may fit: </span>
          {job.fit}
        </p>
      )}
      <a
        href={job.url}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        className="mt-auto self-start py-1.5 text-[15px] font-semibold text-teal-dark underline hover:text-navy"
      >
        View posting <span aria-hidden="true">↗</span>
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    </article>
  );
}
