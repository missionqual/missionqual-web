// Resources topics, in pill order. Plain data, so client components can use it too.
export const TOPICS = [
  { key: "money", label: "The money" },
  { key: "boom", label: "Projects & Locations" },
  { key: "site", label: "Life on site" },
  { key: "equipment", label: "The equipment" },
  { key: "hired", label: "Getting hired" },
] as const;

export type TopicKey = (typeof TOPICS)[number]["key"];

export function topicLabel(key: TopicKey) {
  return TOPICS.find((x) => x.key === key)?.label ?? key;
}
