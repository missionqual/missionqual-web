import Link from "next/link";
import type { ReactNode } from "react";

/** Underlined text link with an arrow that slides right on hover. */
export function ArrowLink({
  href,
  tone = "light",
  children,
}: {
  href: string;
  /** "dark" for use on navy. */
  tone?: "light" | "dark";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 border-b border-current py-2 text-lg font-semibold transition-colors duration-200 ${
        tone === "dark" ? "text-teal-bright hover:text-white" : "text-teal-dark hover:text-navy"
      }`}
    >
      {children}
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:transition-none"
      >
        →
      </span>
    </Link>
  );
}
