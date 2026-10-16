export type JobCardProps = {
  title: string;
  company: string;
  location: string;
  /** Short note on why this role is relevant. */
  context: string;
  /** Backgrounds that transfer well, e.g. ["CWI", "API 510"]. */
  backgrounds: string[];
  url: string;
};

export function JobCard({
  title,
  company,
  location,
  context,
  backgrounds,
  url,
}: JobCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-navy/10 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-navy">{title}</h3>
        <p className="text-sm text-ink/70">
          {company} · {location}
        </p>
      </div>
      <p className="text-ink/90">{context}</p>
      {backgrounds.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Relevant backgrounds">
          {backgrounds.map((b) => (
            <li key={b} className="rounded-full bg-teal/10 px-3 py-1 text-xs font-medium text-navy">
              {b}
            </li>
          ))}
        </ul>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto self-start font-semibold text-teal underline-offset-4 hover:underline"
      >
        View job <span aria-hidden="true">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </article>
  );
}
