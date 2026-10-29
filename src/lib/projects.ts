import "server-only";
import { cacheLife } from "next/cache";
import { anonClient } from "./jobs";

export type Project = {
  id: string;
  name: string;
  owner: string | null;
  city: string | null;
  state: string;
  size: string | null;
  status: string;
  timeline: string | null;
  source_name: string | null;
  source_url: string | null;
  updated_at: string;
};

/**
 * Active data center projects, by state then name. Public (RLS shows active
 * rows to everyone), so cached. Throws on error, so a failure is never cached.
 */
export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("hours");

  const { data, error } = await anonClient()
    .from("projects")
    .select("id, name, owner, city, state, size, status, timeline, source_name, source_url, updated_at")
    .eq("active", true)
    .order("state")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

const STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

/** "TX" → "Texas"; anything unknown comes back as given. */
export function stateName(code: string) {
  return STATES[code.toUpperCase()] ?? code;
}

export type StateGroup = { state: string; id: string; name: string; projects: Project[] };

/** Projects by state: most projects first, then by state name. */
export function groupByState(projects: Project[]): StateGroup[] {
  const by = new Map<string, Project[]>();
  for (const p of projects) by.set(p.state, [...(by.get(p.state) ?? []), p]);
  return [...by]
    .map(([state, list]) => ({ state, id: `state-${state.toLowerCase()}`, name: stateName(state), projects: list }))
    .sort((a, b) => b.projects.length - a.projects.length || a.name.localeCompare(b.name));
}
