import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import shared from "@/src/components/landing/shared.module.css";
import { CommunityBox } from "@/src/components/resources/CommunityBox";
import { MembersOnly } from "@/src/components/resources/MembersOnly";
import { StateJump } from "@/src/components/resources/StateJump";
import { ToolHero } from "@/src/components/resources/ToolHero";
import t from "@/src/components/resources/tools.module.css";
import { getJobCountsByState } from "@/src/lib/jobs";
import { getProjects, stateName, type Project } from "@/src/lib/projects";
import { pageMetadata } from "@/src/lib/seo";
import { createClient } from "@/src/lib/supabase/server";

const PATH = "/resources/projects-by-state";
const TITLE = "Data center projects by state";
const DESCRIPTION = "Major campuses under construction, each with its source, and the jobs we've posted near them.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const updated = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const jobsWord = (n: number) => `${n} open ${n === 1 ? "job" : "jobs"}`;

export default async function ProjectsByStatePage() {
  // Either failing leaves its part empty; the page still renders.
  const [projects, counts] = await Promise.all([
    getProjects().catch((err): Project[] => {
      console.warn("Projects unavailable:", err instanceof Error ? err.message : String(err));
      return [];
    }),
    getJobCountsByState().catch((err) => {
      console.warn("Job counts unavailable:", err instanceof Error ? err.message : String(err));
      return [];
    }),
  ]);

  const jobs = new Map(counts.map((c) => [c.state, c.jobs]));
  // States with projects, plus states with jobs but no projects yet.
  const states = [...new Set([...projects.map((p) => p.state), ...jobs.keys()])].sort((a, b) =>
    stateName(a).localeCompare(stateName(b)),
  );

  return (
    <>
      <ToolHero crumb="Projects by state" title={TITLE}>
        {DESCRIPTION}
      </ToolHero>
      <div className={`${shared.wrap} ${t.page}`}>
        {projects.length === 0 && <p className={t.lede}>We&apos;re adding projects as we confirm them with a source.</p>}
        {states.length > 0 && (
          <StateJump states={states.map((code) => ({ id: code.toLowerCase(), label: stateName(code) }))} />
        )}

        {states.map((code) => {
          const here = projects.filter((p) => p.state === code);
          const n = jobs.get(code) ?? 0;
          return (
            <section key={code} id={code.toLowerCase()} className={t.state} aria-labelledby={`h-${code}`}>
              <div className={t.stateHead}>
                <h2 id={`h-${code}`}>{stateName(code)}</h2>
                <span className={t.count}>
                  {[here.length && `${here.length} ${here.length === 1 ? "project" : "projects"}`, n && jobsWord(n)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
              {here.length > 0 && (
                <div className={t.cards}>
                  {here.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              )}
              {n > 0 && (
                <MembersOnly heading={`${jobsWord(n)} in ${stateName(code)}`} path={`${PATH}#${code.toLowerCase()}`}>
                  <StateJobs state={code} />
                </MembersOnly>
              )}
            </section>
          );
        })}
      </div>
      <CommunityBox
        title="Working on one of these sites?"
        text="Tell people what it's like. Members answer questions about their site in the community."
        back={PATH}
      />
    </>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  const facts = [
    ["City", p.city],
    ["Size", p.size],
    ["Timeline", p.timeline],
  ].filter((x): x is [string, string] => Boolean(x[1]));
  return (
    <article className={t.project}>
      <span className={t.status}>{p.status}</span>
      <h3>{p.name}</h3>
      {p.owner && <p className={t.owner}>{p.owner}</p>}
      {facts.length > 0 && (
        <dl className={t.facts}>
          {facts.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className={t.source}>
        {p.source_name && (
          <span>
            Source:{" "}
            {p.source_url ? (
              <a href={p.source_url} target="_blank" rel="noopener noreferrer">
                {p.source_name}
              </a>
            ) : (
              p.source_name
            )}
          </span>
        )}
        <span>Updated {updated(p.updated_at)}</span>
      </div>
    </article>
  );
}

/** Every active job, read as the member (RLS shows members all of them). Once per request. */
const memberJobs = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, company, location, state")
    .eq("active", true)
    .order("created_at", { ascending: false });
  return data ?? [];
});

/** Members only (rendered inside MembersOnly): this state's jobs as compact cards. */
async function StateJobs({ state }: { state: string }) {
  const jobs = (await memberJobs()).filter((j) => j.state === state);
  const href = `/community/jobs?state=${encodeURIComponent(state)}`;
  return (
    <div className={t.cards}>
      {jobs.map((j) => (
        <Link key={j.id} href={href} className={t.job}>
          <b>{j.title}</b>
          <span>{[j.company, j.location].filter(Boolean).join(" · ")}</span>
        </Link>
      ))}
    </div>
  );
}
