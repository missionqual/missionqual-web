import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CtaButton } from "@/src/components/landing/CtaButton";
import shared from "@/src/components/landing/shared.module.css";
import { GUIDE_COOKIE, GUIDE_PDF } from "@/src/lib/guide";
import s from "./page.module.css";

// Ported from design/guide-thank-you.html.

export const metadata: Metadata = {
  title: "Your guide is ready",
  robots: { index: false, follow: false },
};

const BENEFITS = [
  {
    title: "Straight answers from people on site",
    text: "Which contractors are good to work for, what a site is really like, and what people with your background are actually paid.",
  },
  {
    title: "Jobs This Week",
    text: "Real QA/QC, inspection, commissioning and trade openings, each with a note on why an oil and gas background fits. Posted here first.",
  },
  {
    title: "Introductions",
    text: "When a member’s site or contractor is hiring, you hear about it first and get put in front of the right person.",
  },
  {
    title: "Live sessions",
    text: "Q&As with recruiters who staff data center jobs, and “how I got hired” walk-throughs from members who just made the move.",
  },
];

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

/** Reads the signup cookie at request time; readers without it go back to the modal. */
async function ThankYou() {
  if ((await cookies()).get(GUIDE_COOKIE)?.value !== "1") redirect("/?guide=1");

  return (
    <>
      <section className={s.ty}>
        <div className={`${shared.wrap} ${s.tyInner}`}>
          <div className={s.copy}>
            <p className={`${s.kicker} ${s.kickerOnDark}`}>The Transition Guide</p>
            <h1>Your guide is ready.</h1>
            <p className={s.sub}>
              Download it now. A copy is also on its way to your inbox, so you can come back to it
              later.
            </p>
            <a className={`${shared.btn} ${s.download}`} href={GUIDE_PDF} download>
              <DownloadIcon />
              Download the guide
            </a>
            <p className={s.hint}>
              Short on time? <b>Start with page 3</b>, the short version.
            </p>
          </div>
          <div className={s.coverImg}>
            <Image
              src="/guide-cover.webp"
              alt="From Oil & Gas to Data Center Construction, the MissionQual Transition Guide"
              width={600}
              height={776}
              sizes="(min-width: 1024px) 300px, 170px"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <section className={s.cm}>
        <div className={`${shared.wrap} ${s.cmInner}`}>
          <div className={s.grid}>
            <div>
              <p className={`${s.kicker} ${s.kickerOnLight}`}>The MissionQual community</p>
              <h2 className={s.h2}>
                Don&rsquo;t make this move <em>alone.</em>
              </h2>
              <p className={s.lede}>
                The guide shows you the way. The community walks it with you: a private group of oil
                and gas professionals who have made the move to data center construction, or are
                making it now.
              </p>
              <CtaButton href="/community" arrowWidth={16} className={s.join}>
                Join the community
              </CtaButton>
            </div>
            <div>
              <div className={s.cards}>
                {BENEFITS.map((b, i) => (
                  <div key={b.title} className={s.card}>
                    <span className={s.n}>{String(i + 1).padStart(2, "0")}</span>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </div>
                ))}
              </div>
              {/* Mobile only: a second way in after card 04. */}
              <CtaButton href="/community" arrowWidth={16} className={`${s.join} ${s.joinEnd}`}>
                Join the community
              </CtaButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function GuideThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYou />
    </Suspense>
  );
}
