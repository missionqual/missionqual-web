// TEMPORARY - replace with real jobs before launch.
// Shown on the homepage (in every environment) until the Supabase jobs table
// has at least 4 active jobs. Copy matches the placeholders in the approved design.
import type { JobCardData } from "@/src/components/site/JobCard";

const PLACEHOLDER: Omit<JobCardData, "id"> = {
  state: "TX",
  postedLabel: "[POSTED DATE]",
  title: "[JOB TITLE — e.g. QA/QC Inspector, Data Center]",
  companyLine: "[COMPANY] · [CITY, ST]",
  fit: "[One line on why a refinery background fits this role]",
  url: "/jobs",
};

export const PLACEHOLDER_JOBS: JobCardData[] = [1, 2, 3, 4].map((n) => ({
  ...PLACEHOLDER,
  id: `placeholder-${n}`,
}));
