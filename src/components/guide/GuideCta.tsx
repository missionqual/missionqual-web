"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { CTA_LABEL } from "@/src/components/landing/CtaButton";
import { ArrowRight } from "@/src/components/landing/icons";
import s from "@/src/components/landing/shared.module.css";
import { useGuideCapture, type GuideOptions } from "./GuideCaptureProvider";

/**
 * CtaButton's look (DESIGN_SPEC rule 1) as a <button> that opens the guide
 * email modal. Keeps data-cta for the sticky-bar observer.
 */
export function GuideCta({
  size = "md",
  className = "",
  children = CTA_LABEL,
  arrow = size === "md",
  arrowWidth = 15,
  cta,
}: {
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
  arrow?: boolean;
  arrowWidth?: number;
  /** Marks the button for the sticky-bar observer, e.g. "hero". */
  cta?: string;
}) {
  const openGuide = useGuideCapture();
  return (
    <button
      type="button"
      data-cta={cta}
      aria-haspopup="dialog"
      onClick={(e) => openGuide(e.currentTarget)}
      className={`${s.btn} ${size === "sm" ? s.btnSm : ""} ${className}`}
    >
      {children}
      {arrow && <ArrowRight width={arrowWidth} height={Math.round((arrowWidth * 11) / 15)} />}
    </button>
  );
}

/** Plain-text trigger for link lists and text links (the footer, the Translation Sheet). */
export function GuideTextButton({
  className = "",
  options,
  children,
}: {
  className?: string;
  /** A heading and source for this opening, e.g. the Translation Sheet's. */
  options?: GuideOptions;
  children: ReactNode;
}) {
  const openGuide = useGuideCapture();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(e) => openGuide(e.currentTarget, options)}
      className={className}
    >
      {children}
    </button>
  );
}

/**
 * Header "Get the guide" button. Hidden on the thank-you page, where the reader
 * already has it, and (for signed-in members) anywhere under /community.
 */
export function HeaderGuideCta({
  hideOnCommunity = false,
  ...props
}: Parameters<typeof GuideCta>[0] & { hideOnCommunity?: boolean }) {
  // usePathname() must sit behind Suspense on dynamic routes; the shell shows the button.
  return (
    <Suspense fallback={<GuideCta {...props} />}>
      <PathAwareGuideCta hideOnCommunity={hideOnCommunity} {...props} />
    </Suspense>
  );
}

function PathAwareGuideCta({
  hideOnCommunity = false,
  ...props
}: Parameters<typeof GuideCta>[0] & { hideOnCommunity?: boolean }) {
  const pathname = usePathname();
  if (pathname === "/guide/thank-you") return null;
  if (hideOnCommunity && (pathname === "/community" || pathname.startsWith("/community/"))) return null;
  return <GuideCta {...props} />;
}

