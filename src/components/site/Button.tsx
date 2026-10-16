import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Size = "md" | "lg";

const sizes: Record<Size, string> = {
  // Header: navy text, darkens slightly on hover.
  md: "px-[18px] py-3 text-[15px] text-navy hover:brightness-90",
  // Hero: navy-dark text, lightens slightly on hover.
  lg: "px-7 py-[18px] text-lg text-navy-dark hover:brightness-110",
};

export function buttonClasses(size: Size = "md", className = "") {
  return `inline-block rounded-[4px] bg-teal-bright font-semibold leading-snug transition-[filter] duration-200 ${sizes[size]} ${className}`;
}

/** Bright teal call-to-action, for use on navy. */
export function Button({
  size,
  className,
  ...props
}: { size?: Size } & ComponentPropsWithoutRef<typeof Link>) {
  return <Link className={buttonClasses(size, className)} {...props} />;
}
