// The planned Resources articles and tool cards, exactly as on the design. Each one shows as a card on
// /resources. When its MDX file exists in content/resources/<slug>.mdx with
// status "published", the card links to it; until then the card shows "Coming soon"
// and is not a link.

import type { SectionKey, ToolKey } from "@/src/lib/resources";

export type PlannedItem =
  | { kind: "article"; slug: string; section: SectionKey; title: string; description: string; readMinutes: number }
  | { kind: "tool"; tool: ToolKey; section: SectionKey; title: string; description: string };

export const PLANNED: PlannedItem[] = [
  { kind: "article", slug: "data-center-electrician-pay", section: "money", title: "Data center electrician pay: base, overtime and per diem", description: "Why the $200K headlines are real for some and not others, and how to read an offer.", readMinutes: 7 },
  { kind: "article", slug: "per-diem-12-month-rule", section: "money", title: "Per diem and the 12-month rule, in plain terms", description: "When per diem is tax-free, when it isn't, and what to ask before you sign.", readMinutes: 6 },
  { kind: "article", slug: "union-or-open-shop", section: "money", title: "Union or open shop on a data center job?", description: "How pay, travel and getting hired differ, and how to find out which a project is.", readMinutes: 6 },
  { kind: "article", slug: "how-long-will-the-build-out-last", section: "boom", title: "How long will the data center build-out last?", description: "What the announced projects and hiring data say, from a worker's point of view.", readMinutes: 7 },
  { kind: "article", slug: "is-it-an-ai-bubble", section: "boom", title: "Is it an AI bubble? What it means for your next five years", description: "The honest risks, and how to keep your options open.", readMinutes: 6 },
  { kind: "tool", tool: "projects", section: "boom", title: "Projects by state", description: "Major campuses under construction, and the jobs near them." },
  { kind: "article", slug: "a-week-on-a-data-center-build", section: "site", title: "What a week on a data center build really looks like", description: "Six tens or six twelves, travel, rotations, and who you answer to.", readMinutes: 6 },
  { kind: "article", slug: "getting-badged", section: "site", title: "Getting badged: background checks, drug tests and no-phone rules", description: "What to expect before day one, and how long it takes.", readMinutes: 5 },
  { kind: "article", slug: "clean-rules-and-ppe", section: "site", title: "Clean rules, PPE and what's different from a plant", description: "Why a data center feels different from a refinery the first week.", readMinutes: 5 },
  { kind: "article", slug: "power-side-explained", section: "equipment", title: "UPS, generators and switchgear: the power side in 10 minutes", description: "How power gets to the servers, and what stays on when the utility drops.", readMinutes: 10 },
  { kind: "article", slug: "cooling-side-explained", section: "equipment", title: "Chillers, cooling towers and CRAHs: the cooling side", description: "Where the heat goes, and the piping that carries it.", readMinutes: 9 },
  { kind: "article", slug: "liquid-cooling-and-cdus", section: "equipment", title: "Liquid cooling and CDUs: what's new for pipefitters and mechanical QC", description: "The newest change on AI data centers, and what it means for your scope.", readMinutes: 8 },
  { kind: "article", slug: "technician-or-construction", section: "hired", title: "Data center technician or construction: which job fits you?", description: "Operations vs. building it: pay, schedule, and who each one hires.", readMinutes: 6 },
  { kind: "article", slug: "certs-worth-it", section: "hired", title: "Is NETA, BCxP or OSHA 30 worth it before your first job?", description: "Which certs help, which can wait, and which employers pay for.", readMinutes: 7 },
  { kind: "tool", tool: "interview", section: "hired", title: "Interview questions", description: "Questions you're likely to get for QA/QC, commissioning and turnover roles." },
];
