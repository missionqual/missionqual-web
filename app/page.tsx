import type { Metadata } from "next";
import { FinalCta } from "@/src/components/landing/FinalCta";
import { GuideCards } from "@/src/components/landing/GuideCards";
import { Hero } from "@/src/components/landing/Hero";
import { Jobs } from "@/src/components/landing/Jobs";
import { StickyCta } from "@/src/components/landing/StickyCta";
import { Ticker } from "@/src/components/landing/Ticker";
import { TranslationSheet } from "@/src/components/landing/TranslationSheet";
import { pageMetadata } from "@/src/lib/seo";

// Landing page ported from design/missionqual-landing.html; the rules in
// design/DESIGN_SPEC.md (one CTA style, fold order, section order) must hold.

const TITLE = "MissionQual — From Oil & Gas to Data Center Construction";
const DESCRIPTION =
  "A free guide for API inspectors, CWIs, QA/QC and trades: the roles to target, the skills that transfer, and where the data center jobs are.";

const base = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/" });

export const metadata: Metadata = {
  ...base,
  title: { absolute: TITLE },
  openGraph: { ...base.openGraph, title: TITLE },
  twitter: { ...base.twitter, title: TITLE },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <TranslationSheet />
      <GuideCards />
      <Jobs />
      <FinalCta />
      <StickyCta />
    </>
  );
}
