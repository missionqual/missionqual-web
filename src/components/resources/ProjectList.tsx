import { getProjects, groupByState, type Project } from "@/src/lib/projects";
import s from "./article.module.css";

const AMBER = "Announced, site work started";

/**
 * <ProjectList />: every active project, grouped by state (most projects
 * first). Each state heading has an id the "On this page" list links to.
 */
export async function ProjectList() {
  const projects = await getProjects().catch((err): Project[] => {
    console.warn("Projects unavailable:", err instanceof Error ? err.message : String(err));
    return [];
  });
  if (!projects.length) return <p>We&apos;re adding projects as we confirm them with a source.</p>;

  return (
    <div className={s.states}>
      {groupByState(projects).map((g) => (
        <section key={g.state} className={s.st} id={g.id} aria-labelledby={`${g.id}-h`}>
          <h3 id={`${g.id}-h`}>
            {g.name}{" "}
            <small>
              {g.projects.length} {g.projects.length === 1 ? "project" : "projects"}
            </small>
          </h3>
          <div className={s.stbl}>
            {g.projects.map((p) => (
              <div key={p.id} className={s.proj}>
                <b>{p.name}</b>
                <span className={`${s.chip} ${p.status === AMBER ? s.chipAmber : ""}`}>{p.status}</span>
                {(p.owner || p.city) && <span className={s.o}>{[p.owner, p.city].filter(Boolean).join(" · ")}</span>}
                {(p.size || p.timeline) && (
                  <span className={s.sz}>{[p.size, p.timeline].filter(Boolean).join(" · ")}</span>
                )}
                {p.source_name && (
                  <span className={s.src}>
                    Source:{" "}
                    {p.source_url ? (
                      <a href={p.source_url} target="_blank" rel="noopener noreferrer">
                        {p.source_name}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      p.source_name
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
