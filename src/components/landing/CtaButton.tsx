import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "./icons";
import s from "./shared.module.css";

export const CTA_LABEL = "Send me the free guide";

/**
 * The ONE call-to-action style (DESIGN_SPEC rule 1). Defaults to the standard
 * label with an arrow; the header uses size="sm" with "Get the free guide".
 */
export function CtaButton({
  href,
  size = "md",
  className = "",
  children = CTA_LABEL,
  arrow = size === "md",
  arrowWidth = 15,
  cta,
}: {
  href: string;
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
  arrow?: boolean;
  arrowWidth?: number;
  /** Marks the button for the sticky-bar observer, e.g. "hero". */
  cta?: string;
}) {
  return (
    <Link
      href={href}
      data-cta={cta}
      className={`${s.btn} ${size === "sm" ? s.btnSm : ""} ${className}`}
    >
      {children}
      {arrow && <ArrowRight width={arrowWidth} height={Math.round((arrowWidth * 11) / 15)} />}
    </Link>
  );
}
