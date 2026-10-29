"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GLOSSARY_AREAS, type GlossaryArea, type GlossaryTerm } from "@/content/resources/glossary";
import { ArrowRight } from "@/src/components/landing/icons";
import t from "./tools.module.css";

const AREAS = Object.entries(GLOSSARY_AREAS) as [GlossaryArea, string][];

function askHref(term: string) {
  return `/community/ask?title=${encodeURIComponent(`What does ${term} mean on your site?`)}`;
}

/** Search (term, aka, definition) and area chips over the A–Z term cards. */
export function Glossary({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<GlossaryArea | null>(null);

  // /resources/glossary#ups: the browser's own jump can land before layout settles, so jump again.
  useEffect(() => {
    const el = window.location.hash && document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (el) el.scrollIntoView({ block: "start" });
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const shown = terms
      .filter((x) => !area || x.area === area)
      .filter((x) => !q || [x.term, x.aka ?? "", x.definition].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
    const byLetter = new Map<string, GlossaryTerm[]>();
    for (const x of shown) {
      const letter = x.term[0].toUpperCase();
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), x]);
    }
    return [...byLetter];
  }, [terms, query, area]);
  const total = groups.reduce((n, [, xs]) => n + xs.length, 0);

  return (
    <>
      <div className={t.search}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms, like UPS or turnover"
          aria-label="Search the glossary"
        />
      </div>
      <ul className={t.chips} aria-label="Filter by area">
        <li>
          <button type="button" className={t.chip} aria-pressed={area === null} onClick={() => setArea(null)}>
            All
          </button>
        </li>
        {AREAS.map(([key, label]) => (
          <li key={key}>
            <button type="button" className={t.chip} aria-pressed={area === key} onClick={() => setArea(key)}>
              {label}
            </button>
          </li>
        ))}
      </ul>
      <p className={t.count} aria-live="polite">
        {total === terms.length ? `${total} terms` : `${total} of ${terms.length} terms`}
      </p>

      {groups.length === 0 && (
        <p className={t.none}>
          No terms match that. Try another word, or <Link href={askHref(query.trim() || "a term")}>ask the community</Link>.
        </p>
      )}
      {groups.map(([letter, xs]) => (
        <section key={letter} className={t.group} aria-labelledby={`letter-${letter}`}>
          <h2 className={t.letter} id={`letter-${letter}`}>
            {letter}
          </h2>
          <div className={t.terms}>
            {xs.map((x) => (
              <TermCard key={x.slug} term={x} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function TermCard({ term: x }: { term: GlossaryTerm }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}#${x.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // No clipboard access (http, old browser): at least put the anchor in the address bar.
      window.history.replaceState(window.history.state, "", `#${x.slug}`);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article className={t.term} id={x.slug}>
      <div className={t.termHead}>
        <h3>
          {x.term}
          {x.aka && <span className={t.aka}>{x.aka}</span>}
        </h3>
        <button type="button" className={t.copy} onClick={copyLink} aria-label={`Copy link to ${x.term}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
          </svg>
          <span aria-live="polite">{copied ? "Copied" : ""}</span>
        </button>
      </div>
      <p>{x.definition}</p>
      {x.plant && (
        <p className={t.plant}>
          <b>In oil and gas:</b> {x.plant}
        </p>
      )}
      <div className={t.termFoot}>
        <span className={t.area}>{GLOSSARY_AREAS[x.area]}</span>
        <Link href={askHref(x.term)} className={t.askLink}>
          Ask about this <ArrowRight width={13} height={10} />
        </Link>
      </div>
    </article>
  );
}
