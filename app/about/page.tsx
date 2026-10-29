import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import s from "@/src/components/about/about.module.css";
import { GuideTextButton } from "@/src/components/guide/GuideCta";
import { ArrowRight } from "@/src/components/landing/icons";
import shared from "@/src/components/landing/shared.module.css";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/src/lib/seo";

// Ported from design/about/about.html. One call to action: the join box at the end.

const PATH = "/about";
const EMAIL = "hello@missionqual.com";
const DESCRIPTION =
  "MissionQual was started by two API inspectors who moved from oil and gas into data center QA/QC, to help others make the same move.";

const base = pageMetadata({ title: "About MissionQual", description: DESCRIPTION, path: PATH });
const TITLE = "About MissionQual: built by inspectors who made the move";

export const metadata: Metadata = {
  ...base,
  title: { absolute: TITLE },
  openGraph: { ...base.openGraph, title: TITLE },
  twitter: { ...base.twitter, title: TITLE },
};

const FOUNDERS = [
  {
    name: "Chidi Ajaezi",
    initials: "CA",
    photo: "/team/chidi.jpg",
    creds: ["API 510", "API 570", "10+ years"],
    bio: "Chidi spent more than ten years in oil and gas before moving into data center QA/QC.",
  },
  {
    name: "Lonnie Villermin",
    initials: "LV",
    photo: "/team/lonnie.jpg",
    creds: ["API 510", "API 570", "30+ years"],
    bio: "Lonnie has more than thirty years as an API inspector in oil and gas, and now works in data center QA/QC.",
  },
];

/** A founder photo is used only once its file is in public/team; until then, initials. */
const hasPhoto = (src: string) => existsSync(path.join(process.cwd(), "public", src));

const LINKS = [
  {
    href: "/community",
    title: "The community",
    text: "Ask the people already on data center sites. Q&A, live sessions and a member directory.",
    go: "How it works",
  },
  {
    href: "/#jobs",
    title: "Jobs",
    text: "Hand-picked openings, each with a note on why an oil and gas background fits.",
    go: "See recent jobs",
  },
  {
    href: "/resources",
    title: "Resources",
    text: "Pay, the sites, life on site and the equipment, in plain field language.",
    go: "Read the articles",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: new URL("/missionqual-icon-square-512.png", SITE_URL).toString(),
    email: EMAIL,
    address: { "@type": "PostalAddress", addressLocality: "Houston", addressRegion: "TX", addressCountry: "US" },
    founder: FOUNDERS.map((f) => ({ "@type": "Person", name: f.name })),
  };
  const next = encodeURIComponent("/community");

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so the JSON can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={s.hero}>
        <div className={`${shared.wrap} ${s.heroInner}`}>
          <div>
            <p className={s.kick}>About MissionQual</p>
            <h1>
              Built by inspectors who <em>made the move.</em>
            </h1>
            <p className={s.sub}>
              We spent our careers in oil and gas. Now we work on data center builds. MissionQual is how we help the
              people we used to work beside do the same.
            </p>
          </div>
          <dl className={s.ledger} aria-label="MissionQual at a glance">
            <div>
              <dt>40+</dt>
              <dd>years in oil and gas between the two founders</dd>
            </div>
            <div>
              <dt>API</dt>
              <dd>510 and 570 certified inspectors, both of us</dd>
            </div>
            <div>
              <dt>Now</dt>
              <dd>working data center QA/QC, not watching it from outside</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={`${shared.wrap} ${s.story}`} aria-labelledby="h-story">
        <div className={s.storyGrid}>
          <div>
            <p className={s.kick}>Why we started</p>
            <h2 id="h-story" className={s.h2}>
              The work was familiar. The words weren&apos;t.
            </h2>
          </div>
          <div className={s.body}>
            <p>
              When we moved from oil and gas into data center QA/QC, most of the job made sense on day one. Pressure
              tests, weld inspection, witness points: we&apos;d done all of it on refineries, LNG plants and
              turnarounds.
            </p>
            <p>
              What we didn&apos;t have was the language. Commissioning, FOK (first of kind), benchmarking, Level 3
              complete. Nobody had written any of it down for people like us.
            </p>
            <p>
              Then people from our old crews started asking. Inspectors, fitters and QA/QC people, all with the same
              questions: Is it real? Who&apos;s hiring? What does it pay? How do I get in? We built MissionQual so
              those answers live in one place, and so the people asking can talk to the people who&apos;ve already done
              it.
            </p>
            <p className={s.pull}>
              Your experience counts. You just need to know what it&apos;s called on a data center site.
            </p>
          </div>
        </div>
      </section>

      <section className={`${shared.wrap} ${s.sec}`} aria-labelledby="h-team">
        <div className={s.head}>
          <p className={s.kick}>The founders</p>
          <h2 id="h-team" className={s.h2}>
            Two inspectors, one mission.
          </h2>
        </div>
        <div className={s.founders}>
          {FOUNDERS.map((f) => (
            <article key={f.name} className={s.fd}>
              <div className={s.ph}>
                {hasPhoto(f.photo) ? (
                  <Image src={f.photo} alt={f.name} fill sizes="(min-width: 1024px) 220px, 100vw" />
                ) : (
                  <span className={s.ini} aria-hidden="true">
                    {f.initials}
                  </span>
                )}
              </div>
              <div className={s.tx}>
                <span className={s.role}>Co-founder</span>
                <h3>{f.name}</h3>
                <ul className={s.creds} aria-label="Credentials">
                  {f.creds.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p>{f.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${shared.wrap} ${s.sec}`} aria-labelledby="h-offer">
        <div className={s.head}>
          <p className={s.kick}>What you&apos;ll find here</p>
          <h2 id="h-offer" className={s.h2}>
            Everything we wish we&apos;d had.
          </h2>
        </div>
        <div className={s.offer}>
          {/* Opens the guide pop-up rather than linking to a page. */}
          <GuideTextButton className={s.of}>
            <b>The Transition Guide</b>
            <span className={s.ofText}>The roles to target, the skills that transfer, and how to sell your experience.</span>
            <span className={s.go}>
              See the guide <ArrowRight width={14} height={11} />
            </span>
          </GuideTextButton>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={s.of}>
              <b>{l.title}</b>
              <span className={s.ofText}>{l.text}</span>
              <span className={s.go}>
                {l.go} <ArrowRight width={14} height={11} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className={shared.wrap}>
        <div className={s.finale}>
          <div>
            <h2>Make the move with people who&apos;ve done it.</h2>
            <p>
              Join the community to ask your questions, see every job we post, and meet people from your trade who are
              already on data center sites.
            </p>
          </div>
          <div className={s.acts}>
            <Link href={`/signup?next=${next}`} className={`${shared.btn} ${s.btn}`}>
              Join the community <ArrowRight width={15} height={11} />
            </Link>
            <p className={s.si}>
              Already a member? <Link href={`/login?next=${next}`}>Sign in</Link>
            </p>
          </div>
        </div>
        <p className={s.contact}>
          Press, partnerships or anything else: <b>{EMAIL}</b> · Houston, Texas
        </p>
      </div>
    </>
  );
}
