// TEMPORARY - replace with real jobs before launch.
// The three cards from design/missionqual-landing.html. TODO: load real postings
// instead (getLatestJobs in src/lib/jobs.ts reads the Supabase jobs table) and
// map them to LandingJob; DESIGN_SPEC rule 8 requires a real posted date.

export type LandingJob = {
  id: string;
  /** Two-letter state, shown top left. */
  state: string;
  /** ISO date the job was posted. */
  postedAt: string;
  title: string;
  company: string;
  city: string;
  /** One honest line on why an industrial background may fit. */
  fit: string;
  url: string;
};

export const PLACEHOLDER_JOBS: LandingJob[] = [
  {
    id: "placeholder-1",
    state: "TX",
    postedAt: "2026-10-14",
    title: "QA/QC Inspector, Data Center",
    company: "[Company]",
    city: "Temple, TX",
    fit: "ITP-driven inspection on mechanical scopes maps straight to Cx test witnessing.",
    url: "/jobs",
  },
  {
    id: "placeholder-2",
    state: "TX",
    postedAt: "2026-10-13",
    title: "Commissioning Technician (MEP)",
    company: "[Company]",
    city: "San Antonio, TX",
    fit: "Loop checks and hydrotest sign-off experience covers most of the L2–L3 scope.",
    url: "/jobs",
  },
  {
    id: "placeholder-3",
    state: "LA",
    postedAt: "2026-10-10",
    title: "Quality Manager, Mission Critical",
    company: "[Company]",
    city: "Richland Parish, LA",
    fit: "Turnaround QA leadership and NCR management are the exact ask, new nameplate.",
    url: "/jobs",
  },
];
