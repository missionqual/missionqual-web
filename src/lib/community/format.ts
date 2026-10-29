// Pure formatting helpers (safe on server and client).

export function firstName(name: string | null | undefined) {
  return (name ?? "").trim().split(/\s+/)[0] || "Member";
}

export function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "M";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Stable tint (c1–c4 in the designs) per member id. */
export function avatarTone(id: string | null | undefined): 1 | 2 | 3 | 4 {
  let h = 0;
  for (const ch of id ?? "") h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ((h % 4) + 1) as 1 | 2 | 3 | 4;
}

const SHORT_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" });
const SHORT_DATE_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/Chicago",
});

/** "just now", "40m ago", "2h ago", "Yesterday", "3 days ago", then "Oct 2". */
export function relativeTime(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const mins = Math.floor((now - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 2) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const sameYear = new Date(then).getFullYear() === new Date(now).getFullYear();
  return (sameYear ? SHORT_DATE : SHORT_DATE_YEAR).format(new Date(then));
}

export function shortDate(iso: string) {
  return SHORT_DATE.format(new Date(iso));
}

/** "Member since Sep 2026". */
export function monthYear(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "America/Chicago" }).format(
    new Date(iso),
  );
}

/** Job dates are calendar dates (YYYY-MM-DD), so format them in UTC. */
export function postedDate(date: string | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(date))
    .toUpperCase();
}

/** Monday of the current week in Central time, e.g. "October 19". */
export function weekOf(now = new Date()) {
  const ct = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const back = (ct.getDay() + 6) % 7;
  ct.setDate(ct.getDate() - back);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(ct);
}

/** Pieces of a session start time in Central time. */
export function sessionTime(iso: string) {
  const d = new Date(iso);
  const part = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", ...opts }).format(d);
  return {
    month: part({ month: "short" }).toUpperCase(),
    day: part({ day: "2-digit" }),
    weekday: part({ weekday: "short" }),
    time: part({ hour: "numeric", minute: "2-digit" }),
    date: part({ month: "short", day: "numeric" }),
  };
}

/** Two-letter state after the last comma in "City, ST". */
export function stateFromLocation(location: string | null | undefined) {
  const m = (location ?? "").match(/,\s*([A-Za-z]{2})\s*$/);
  return m ? m[1].toUpperCase() : null;
}

const SMALL = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
/** "Six" for small counts, digits above ten. */
export function countWord(n: number) {
  return n <= 10 ? SMALL[n] : String(n);
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Plain one-line excerpt of member text. */
export function excerpt(text: string | null | undefined, max = 200) {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export type CompletenessInput = {
  job_title: string | null;
  dc_status: string | null;
  years_experience: number | null;
  certifications: string[] | null;
  disciplines: string[] | null;
  location: string | null;
  about: string | null;
};

/** Share of the seven profile fields that are filled, 0–100. */
export function profileCompleteness(p: CompletenessInput) {
  const filled = [
    p.job_title?.trim(),
    p.dc_status,
    p.years_experience !== null && p.years_experience !== undefined,
    p.certifications?.length,
    p.disciplines?.length,
    p.location?.trim(),
    p.about?.trim(),
  ].filter(Boolean).length;
  return Math.round((filled / 7) * 100);
}

/** Only same-site relative paths; anything else falls back. */
export function safeNext(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
