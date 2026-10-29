import { JOB_CATEGORIES, type JobCategory } from "@/src/lib/community/constants";
import { formatPay, getPaySummary, type PaySummary } from "@/src/lib/jobs";
import s from "./article.module.css";

/**
 * <PayRanges />: one row per role category and pay unit, from every active
 * job with pay ("QA/QC & inspection: $60–70/hr, from 1 posting").
 */
export async function PayRanges() {
  const summary = await getPaySummary().catch((err): PaySummary[] => {
    console.warn("Pay summary unavailable:", err instanceof Error ? err.message : String(err));
    return [];
  });
  // Category order from JOB_CATEGORIES; hourly before yearly; empty categories don't show.
  const rows = (Object.keys(JOB_CATEGORIES) as JobCategory[]).flatMap((key) =>
    summary
      .filter((r) => r.category === key)
      .sort((a, b) => (a.pay_unit === "hour" ? -1 : 1) - (b.pay_unit === "hour" ? -1 : 1))
      .map((r) => ({ ...r, label: JOB_CATEGORIES[key] })),
  );
  if (!rows.length) return <p>No pay data yet. It shows here as we post jobs with pay.</p>;

  return (
    <ul className={s.pay}>
      {rows.map((r) => (
        <li key={`${r.category}|${r.pay_unit}`}>
          <span className={s.payRole}>{r.label}:</span> <b>{formatPay(r.low, r.high, r.pay_unit)}</b>
          <span className={s.payN}>
            , from {r.postings} {r.postings === 1 ? "posting" : "postings"}
          </span>
        </li>
      ))}
    </ul>
  );
}
