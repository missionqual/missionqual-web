import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLink } from "@/src/components/site/ArrowLink";
import { Button } from "@/src/components/site/Button";
import { ClosingBand } from "@/src/components/site/ClosingBand";
import { Container } from "@/src/components/site/Container";
import { JobCard, toJobCardData } from "@/src/components/site/JobCard";
import { AUDIENCE } from "@/src/components/site/nav-links";
import { getLatestJobs } from "@/src/lib/jobs";
import { PLACEHOLDER_JOBS } from "@/src/lib/placeholder-jobs";
import { pageMetadata } from "@/src/lib/seo";

const TITLE = "MISSIONQUAL — From Oil & Gas to Data Center Construction";
const DESCRIPTION =
  "A guide for API inspectors, CWIs, QA/QC and trades coming from oil & gas: the roles to target, the skills that transfer, and where the jobs are.";

const base = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/" });

export const metadata: Metadata = {
  ...base,
  title: { absolute: TITLE },
  openGraph: { ...base.openGraph, title: TITLE },
  twitter: { ...base.twitter, title: TITLE },
};

const TRANSLATIONS = [
  ["ITPs, hold & witness points", "Same discipline, new systems"],
  ["Mechanical completion", "Commissioning levels L1–L5"],
  ["Process unit", "Data hall"],
  ["10-week turnaround", "Multi-year campus build"],
];

const GUIDE_CARDS = [
  {
    title: "The roles to target",
    text: "The exact titles employers post for QA/QC, inspection and commissioning on data center builds — and who posts them.",
  },
  {
    title: "The skills that transfer",
    text: "Inspection, welding, piping, ITPs, hydrotests, turnover — what carries over as-is, and the specific gaps to close.",
  },
  {
    title: "Where the jobs are",
    text: "Texas, Louisiana and the national build-out — plus a 30-day plan: résumé lines, search terms, who to contact.",
  },
];

const JOBS_SHOWN = 4;

const h2 = "font-heading font-extrabold leading-[1.1] text-navy font-stretch-125%";

export default async function Home() {
  return (
    <>
      <Hero />
      <section aria-label="Who it's for" className="border-b border-line bg-strip">
        <Container className="py-[18px] text-center font-mono text-[13px] leading-[1.7] tracking-[0.08em] text-steel">
          {AUDIENCE}
        </Container>
      </section>
      <Translation />
      <GuideContents />
      <Jobs />
      <ClosingBand />
    </>
  );
}

function Hero() {
  return (
    <section className="surface-dark bg-navy text-white">
      <Container className="flex flex-wrap items-center gap-10 pb-[72px] pt-14">
        <div className="flex min-w-0 flex-[7_1_520px] flex-col gap-7">
          <h1 className="font-heading text-[clamp(34px,4vw,54px)] font-extrabold leading-[1.08] tracking-[-0.01em] font-stretch-125%">
            From Oil &amp; Gas to Data Center Construction.{" "}
            <span className="text-teal-bright">Without Starting Over.</span>
          </h1>
          <p className="max-w-[600px] text-[19px] leading-[1.55] text-mist">{DESCRIPTION}</p>
          <div className="pt-1">
            <Button href="/guide" size="lg">
              Get the free Transition Guide
            </Button>
          </div>
        </div>
        {/* On desktop the column stretches to the text block's height and the
            book scales down inside it, so it is never taller than the text. */}
        <div className="flex min-w-0 flex-[5_1_320px] justify-center lg:self-stretch">
          <div className="relative aspect-[680/928] w-full max-w-[290px] lg:aspect-auto lg:max-w-[340px]">
            <Image
              src="/guide-book.png"
              alt="The MISSIONQUAL Transition Guide: From Oil & Gas to Data Center Construction"
              fill
              sizes="(min-width: 1024px) 340px, 290px"
              priority
              className="object-contain"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function Translation() {
  return (
    <section className="bg-paper">
      <Container className="flex flex-wrap items-center gap-14 py-24">
        <div className="flex min-w-0 flex-[1_1_400px] flex-col items-start gap-6">
          <h2 className={`${h2} text-[clamp(28px,3.4vw,42px)]`}>
            Years of field experience shouldn&apos;t become{" "}
            <span className="text-teal-dark">year zero.</span>
          </h2>
          <p className="text-[19px] leading-[1.6] text-body">
            Most of what you already do on a refinery job has a direct match on a data center
            build. Here are four. The full sheet in the guide covers inspection, welding, piping,
            commissioning and turnover — so you can write your résumé and answer interview
            questions in the language hiring managers use.
          </p>
          <ArrowLink href="/guide">See the full translation sheet in the guide</ArrowLink>
        </div>

        <div className="min-w-0 flex-[1_1_400px] overflow-hidden rounded-md border border-line-strong bg-white shadow-[0_12px_32px_rgba(31,42,68,0.10)]">
          <table className="w-full table-fixed border-collapse text-base leading-[1.4] text-ink">
            <caption className="bg-navy px-5 py-[18px] font-heading text-xl font-extrabold tracking-[0.02em] text-white font-stretch-125%">
              Translation Sheet
            </caption>
            <thead className="border-b border-line-strong bg-sheet-head text-[15px] text-navy">
              <tr>
                <th scope="col" className="border-r border-line-strong px-5 py-3.5 font-bold">
                  On a refinery job
                </th>
                <th scope="col" className="px-5 py-3.5 font-bold">
                  On a data center build
                </th>
              </tr>
            </thead>
            <tbody>
              {TRANSLATIONS.map(([refinery, dataCenter]) => (
                <tr key={refinery} className="border-b border-line-soft last:border-b-0">
                  <td className="border-r border-line-strong px-5 py-[18px] align-top">
                    {refinery}
                  </td>
                  <td className="px-5 py-[18px] align-top font-bold text-teal-dark">{dataCenter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}

function GuideContents() {
  return (
    <section className="border-y border-line bg-white">
      <Container className="flex flex-col gap-10 py-24">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className={`${h2} text-[clamp(28px,3.4vw,40px)]`}>What the guide gives you</h2>
          <p className="text-lg text-body">
            Three things you need before you apply — in plain field language.
          </p>
        </div>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {GUIDE_CARDS.map((card, i) => (
            <li
              key={card.title}
              className="flex flex-col gap-3.5 rounded-md border border-line bg-paper p-8"
            >
              <span aria-hidden="true" className="font-mono text-[13px] tracking-[0.1em] text-teal-dark">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[22px] font-semibold text-navy">{card.title}</h3>
              <p className="text-base leading-[1.6] text-body">{card.text}</p>
            </li>
          ))}
        </ol>
        <div>
          <ArrowLink href="/guide">Get the free Transition Guide</ArrowLink>
        </div>
      </Container>
    </section>
  );
}

async function Jobs() {
  const latest = await getLatestJobs(JOBS_SHOWN);
  // Real jobs once there are enough to fill the row; until then, placeholders.
  const jobs =
    latest.length >= JOBS_SHOWN ? latest.map(toJobCardData) : PLACEHOLDER_JOBS;

  return (
    <section className="bg-paper">
      <Container className="flex flex-col gap-10 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h2 className={`${h2} text-[clamp(28px,3.4vw,40px)]`}>Data center jobs this week</h2>
            <p className="text-lg text-body">
              Curated weekly, each with a note on why an industrial background may fit.
            </p>
          </div>
          <Link
            href="/jobs"
            className="py-2.5 text-base font-semibold text-teal-dark underline hover:text-navy"
          >
            See all jobs <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </Container>
    </section>
  );
}
