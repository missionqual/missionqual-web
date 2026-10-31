"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@/src/components/landing/icons";
import o from "./onboarding.module.css";

/**
 * Top of the member home after /welcome (design/onboarding/welcome-panel.html).
 * Shown only with ?welcome=1; the ✕ drops that from the URL.
 */
export function WelcomePanel({ firstName, introHref }: { firstName: string; introHref: string }) {
  const router = useRouter();

  function dismiss() {
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    router.replace(url.pathname + url.search, { scroll: false });
  }

  const steps = [
    {
      href: introHref,
      title: "Introduce yourself",
      text: "Your trade, your certs, where you are and where you want to land. One paragraph is plenty.",
      go: "Post your intro",
    },
    {
      href: "/community/ask",
      title: "Ask your first question",
      text: "Certs, offers, contractors, a test you've never seen. People already on site answer.",
      go: "Ask a question",
    },
    {
      href: "/community/jobs",
      title: "See this week's jobs",
      text: "Hand-picked openings, each with a note on why an oil and gas background fits.",
      go: "Browse jobs",
    },
  ];

  return (
    <section className={o.wp} aria-labelledby="welcome-heading">
      <button className={o.x} type="button" aria-label="Dismiss" onClick={dismiss}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <p className={o.wpKick}>You&rsquo;re in</p>
      {/* h2: the member home below keeps its own h1. */}
      <h2 id="welcome-heading">Welcome to the community, {firstName}.</h2>
      <p className={o.wpLine}>Here&rsquo;s where to start. Most people begin with an introduction.</p>
      <div className={o.steps}>
        {steps.map((st, i) => (
          <Link key={st.title} className={o.st} href={st.href}>
            <span className={o.n}>0{i + 1}</span>
            <b>{st.title}</b>
            <span className={o.t}>{st.text}</span>
            <span className={o.go}>
              {st.go} <ArrowRight width={14} height={11} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
