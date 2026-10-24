import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/src/components/community/bits";
import { CommunityNav } from "@/src/components/community/CommunityNav";
import s from "@/src/components/community/community.module.css";
import { FilterSelect } from "@/src/components/community/FilterSelect";
import { LocationIcon } from "@/src/components/community/icons";
import m from "@/src/components/community/members.module.css";
import { MemberSearch } from "@/src/components/community/MemberSearch";
import shared from "@/src/components/landing/shared.module.css";
import { DC_STATUS, MEMBERS_PAGE_SIZE, isDcStatus } from "@/src/lib/community/constants";
import { stateFromLocation } from "@/src/lib/community/format";
import { requireViewer } from "@/src/lib/community/viewer";
import { createClient } from "@/src/lib/supabase/server";

export const metadata: Metadata = { title: "Members", robots: { index: false, follow: false } };

type Search = Awaited<PageProps<"/community/members">["searchParams"]>;
const one = (v: Search[string]) => (Array.isArray(v) ? v[0] : v) ?? "";

function href(params: Record<string, string>) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const qs = q.toString();
  return qs ? `/community/members?${qs}` : "/community/members";
}

async function Members({ searchParams }: { searchParams: PageProps<"/community/members">["searchParams"] }) {
  await requireViewer("/community/members");
  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 80);
  const status = isDcStatus(one(sp.status)) ? one(sp.status) : "";
  const page = Math.max(1, Math.min(50, Number.parseInt(one(sp.page) || "1", 10) || 1));

  // Certifications are a text[] column, which PostgREST can't search
  // case-insensitively, so v1 filters the (small) member list here.
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, job_title, location, years_experience, certifications, disciplines, dc_status")
    .order("display_name");
  const everyone = (data ?? []).filter((p) => p.display_name);

  const disciplines = [...new Set(everyone.flatMap((p) => p.disciplines ?? []))].sort();
  const states = [...new Set(everyone.map((p) => stateFromLocation(p.location)).filter((x): x is string => Boolean(x)))].sort();
  const discipline = disciplines.includes(one(sp.discipline)) ? one(sp.discipline) : "";
  const state = states.includes(one(sp.state)) ? one(sp.state) : "";

  const needle = q.toLowerCase();
  const matches = everyone.filter(
    (p) =>
      (!needle ||
        p.display_name!.toLowerCase().includes(needle) ||
        (p.job_title ?? "").toLowerCase().includes(needle) ||
        (p.certifications ?? []).some((c) => c.toLowerCase().includes(needle))) &&
      (!discipline || (p.disciplines ?? []).includes(discipline)) &&
      (!state || stateFromLocation(p.location) === state) &&
      (!status || p.dc_status === status),
  );
  const shown = matches.slice(0, page * MEMBERS_PAGE_SIZE);
  const onSite = everyone.filter((p) => p.dc_status === "on_site").length;

  return (
    <div className={`${shared.wrap} ${s.page}`}>
      <div className={s.ph}>
        <div>
          <h1>Members</h1>
          <p>
            {everyone.length >= 50
              ? `${everyone.length} people from oil and gas. ${onSite} are already on data center sites.`
              : "People from oil and gas, on data center sites and making the move."}
          </p>
        </div>
      </div>

      <div className={m.filter}>
        <MemberSearch defaultValue={q} />
        <FilterSelect
          param="discipline"
          value={discipline}
          label="Filter by discipline"
          options={[{ value: "", label: "Any discipline" }, ...disciplines.map((d) => ({ value: d, label: d }))]}
          className={m.sel}
        />
        <FilterSelect
          param="state"
          value={state}
          label="Filter by state"
          options={[{ value: "", label: "Any state" }, ...states.map((x) => ({ value: x, label: x }))]}
          className={m.sel}
        />
      </div>

      <div className={`${s.chips} ${s.chipsScroll}`} style={{ marginBottom: 24 }}>
        {[["", "Everyone"], ...Object.entries(DC_STATUS)].map(([value, label]) => (
          <Link
            key={value}
            className={`${s.chip} ${status === value ? s.chipOn : ""}`}
            href={href({ q, discipline, state, status: value })}
            aria-current={status === value || undefined}
          >
            {label}
          </Link>
        ))}
      </div>

      {shown.length ? (
        <div className={m.grid}>
          {shown.map((p) => (
            <Link key={p.id} className={`${s.card} ${m.card}`} href={`/community/members/${p.id}`}>
              <div className={m.head}>
                <Avatar id={p.id} name={p.display_name} size="lg" />
                <div style={{ minWidth: 0 }}>
                  <b className={m.name}>{p.display_name}</b>
                  {(p.location || p.years_experience !== null) && (
                    <span className={`${s.meta} ${m.where}`}>
                      {p.location && <LocationIcon />}
                      {[p.location, p.years_experience !== null ? `${p.years_experience} yrs` : null].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>
              </div>
              <p className={m.role}>{p.job_title}</p>
              <div className={s.tags}>
                {isDcStatus(p.dc_status) && (
                  <span className={p.dc_status === "on_site" ? s.tag : s.tagGrey}>{DC_STATUS[p.dc_status]}</span>
                )}
                {(p.certifications ?? []).slice(0, 4).map((c) => (
                  <span key={c} className={s.tagGrey}>
                    {c}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          <p>No members match those filters.</p>
        </div>
      )}

      {shown.length < matches.length && (
        <div className={s.center} style={{ marginTop: 28 }}>
          <Link className={s.btn2} href={href({ q, discipline, state, status, page: String(page + 1) })} scroll={false}>
            Show more members
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MembersPage(props: PageProps<"/community/members">) {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
      <CommunityNav current="members" />
      <Members searchParams={props.searchParams} />
    </Suspense>
  );
}
