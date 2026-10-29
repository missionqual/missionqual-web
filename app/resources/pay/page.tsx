import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/src/components/landing/icons";
import shared from "@/src/components/landing/shared.module.css";
import { CommunityBox } from "@/src/components/resources/CommunityBox";
import { MembersOnly } from "@/src/components/resources/MembersOnly";
import s from "@/src/components/resources/resources.module.css";
import { ToolHero } from "@/src/components/resources/ToolHero";
import t from "@/src/components/resources/tools.module.css";
import { JOB_CATEGORIES, type JobCategory } from "@/src/lib/community/constants";
import { getPaySummary, type PaySummary } from "@/src/lib/jobs";
import { stateName } from "@/src/lib/projects";
import { pageMetadata } from "@/src/lib/seo";
import { createClient } from "@/src/lib/supabase/server";

const PATH = "/resources/pay";
const TITLE = "Pay from real postings";
const DESCRIPTION = "Rates, per diem and overtime from the jobs we post. Updated as we post.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

/** "$60–70/hr", "$100k–150k/yr", or one number when low and high match. */
function payRange(low: number, high: number, unit: string | null) {
  const year = unit === "year";
  const fmt = (n: number) => (year ? `${Math.round(n / 1000)}k` : `${Math.round(n * 100) / 100}`);
  const lo = fmt(low);
  const hi = fmt(high);
  return `$${lo === hi ? lo : `${lo}–${hi}`}${year ? "/yr" : "/hr"}`;
}
const postingsWord = (n: number) => `from ${n} ${n === 1 ? "posting" : "postings"}`;

export default async function PayPage() {
  const summary = await getPaySummary().catch((err): PaySummary[] => {
    console.warn("Pay summary unavailable:", err instanceof Error ? err.message : String(err));
    return [];
  });
  // Category order from JOB_CATEGORIES; categories with no pay data don't show.
  const categories = (Object.keys(JOB_CATEGORIES) as JobCategory[])
    .map((key) => ({ key, label: JOB_CATEGORIES[key], rows: summary.filter((r) => r.category === key) }))
    .filter((c) => c.rows.length > 0);

  return (
    <>
      <ToolHero crumb="Pay" title={TITLE}>
        From the jobs we&apos;ve posted. A small sample right now; it grows as we post.
      </ToolHero>
      <div className={`${shared.wrap} ${t.page}`}>
        {categories.length === 0 ? (
          <p className={t.lede}>No pay data yet. It shows here as we post jobs with pay.</p>
        ) : (
          <div className={t.cards}>
            {categories.map((c) => (
              <div key={c.key} className={t.payCard}>
                <h3>{c.label}</h3>
                {c.rows.map((r) => (
                  <div key={r.pay_unit} className={t.range}>
                    <b>{payRange(r.low, r.high, r.pay_unit)}</b>
                    <span>{postingsWord(r.postings)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <MembersOnly heading="See pay by state and every posting behind these numbers" text={null} path={PATH}>
          <MemberPay />
        </MembersOnly>

        <Link href={`/community/ask?title=${encodeURIComponent("Offer check: ")}`} className={`${s.btnO} ${t.offer}`}>
          Post your offer in the community for a check <ArrowRight width={14} height={11} />
        </Link>
      </div>
      <CommunityBox
        title="Not sure an offer is fair?"
        text="Members on data center sites will tell you what they'd expect for the role and the area."
        back={PATH}
      />
    </>
  );
}

/** Members only (rendered inside MembersOnly): every posting with pay, and ranges by state. */
async function MemberPay() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, company, state, pay_min, pay_max, pay_unit, per_diem_day")
    .eq("active", true)
    .not("pay_min", "is", null)
    .order("state")
    .order("pay_min", { ascending: false });
  const jobs = (data ?? []).filter((j): j is typeof j & { pay_min: number } => j.pay_min !== null);

  const byState = new Map<string, { state: string; unit: string | null; low: number; high: number; n: number }>();
  for (const j of jobs) {
    const key = `${j.state ?? "—"}|${j.pay_unit}`;
    const high = j.pay_max ?? j.pay_min;
    const cur = byState.get(key);
    byState.set(
      key,
      cur
        ? { ...cur, low: Math.min(cur.low, j.pay_min), high: Math.max(cur.high, high), n: cur.n + 1 }
        : { state: j.state ?? "—", unit: j.pay_unit, low: j.pay_min, high, n: 1 },
    );
  }

  return (
    <>
      <h2 className={t.h2}>Ranges by state</h2>
      <div className={t.tbl} role="region" aria-label="Pay ranges by state" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th>State</th>
              <th>Range</th>
              <th>Postings</th>
            </tr>
          </thead>
          <tbody>
            {[...byState.values()].map((r) => (
              <tr key={`${r.state}|${r.unit}`}>
                <td>{stateName(r.state)}</td>
                <td className={t.num}>{payRange(r.low, r.high, r.unit)}</td>
                <td>{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className={t.h2}>Every posting with pay</h2>
      <div className={t.tbl} role="region" aria-label="Every posting with pay" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>State</th>
              <th>Pay</th>
              <th>Per diem</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.company ?? "—"}</td>
                <td>{j.state ?? "—"}</td>
                <td className={t.num}>{payRange(j.pay_min, j.pay_max ?? j.pay_min, j.pay_unit)}</td>
                <td className={t.num}>{j.per_diem_day ? `$${j.per_diem_day}/day` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
