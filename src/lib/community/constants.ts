// Labels and option lists shared by the community pages, forms and actions.

export const TOPICS = {
  qa_qc: "QA/QC",
  welding_piping: "Welding & piping",
  electrical_ie: "Electrical & I&E",
  commissioning: "Commissioning",
  pay_offers: "Pay & offers",
  getting_hired: "Getting hired",
  life_on_site: "Life on site",
  introductions: "Introductions",
} as const;

export type Topic = keyof typeof TOPICS;

/** Feed filter chips and the Ask picker leave "introductions" out (it's the pinned thread). */
export const ASKABLE_TOPICS = Object.keys(TOPICS).filter((t) => t !== "introductions") as Topic[];

export function isTopic(value: unknown): value is Topic {
  return typeof value === "string" && value in TOPICS;
}

export function topicLabel(category: string | null | undefined) {
  return isTopic(category) ? TOPICS[category] : "Question";
}

export const JOB_CATEGORIES = {
  qa_qc: "QA/QC & inspection",
  commissioning: "Commissioning",
  turnover_docs: "Turnover & docs",
  trades: "Trades",
} as const;

export type JobCategory = keyof typeof JOB_CATEGORIES;

export const DISCIPLINES = [
  "QA/QC",
  "Welding & piping",
  "Electrical & I&E",
  "Commissioning",
  "Turnover & docs",
  "Mechanical",
  "Civil/structural",
] as const;

export const DC_STATUS = {
  on_site: "On a data center site",
  making_move: "Making the move",
} as const;

export type DcStatus = keyof typeof DC_STATUS;

export function isDcStatus(value: unknown): value is DcStatus {
  return typeof value === "string" && value in DC_STATUS;
}

/** The lowercase form used inside author lines ("API 570 inspector · making the move"). */
export function dcStatusPhrase(status: string | null | undefined) {
  if (status === "on_site") return "on a data center site";
  if (status === "making_move") return "making the move";
  return null;
}

export const FEED_PAGE_SIZE = 20;
export const MEMBERS_PAGE_SIZE = 24;
export const QUESTION_LIMIT_PER_DAY = 10;
export const ANSWER_LIMIT_PER_DAY = 50;
export const TITLE_MIN = 10;
export const TITLE_MAX = 160;
export const BODY_MAX = 10000;
export const ABOUT_MAX = 500;

export const SESSION_PROPOSAL_MAILTO =
  "mailto:chidi@missionqual.com?subject=" + encodeURIComponent("I'd like to run a session");

/** The four house rules (join page, /community/rules). */
export const HOUSE_RULES = [
  { title: "Real name, real role.", text: "People answer differently when they know who's asking." },
  {
    title: "Nothing under NDA.",
    text: "No site drawings, photos, owner documents or anything you signed for. Talk about the work, not the client's secrets.",
  },
  {
    title: "No selling.",
    text: "No courses, no MLM, no cold recruiting in people's replies. Recruiters are welcome in the live sessions.",
  },
  {
    title: "Answer like a professional.",
    text: "Straight and specific. Everyone here has years in the field, so nobody gets talked down to.",
  },
] as const;

export const SIGNUP_HREF = `/signup?next=${encodeURIComponent("/account?welcome=1")}`;
export const SIGNIN_HREF = "/login?next=/community";
