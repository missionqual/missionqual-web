import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "link";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "rounded-md bg-teal px-5 py-2.5 text-white hover:bg-teal/90",
  secondary:
    "rounded-md border-2 border-navy px-5 py-2 text-navy hover:bg-navy hover:text-white",
  link: "text-teal underline-offset-4 hover:underline",
};

export function buttonClasses(variant: Variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

type ButtonAsLink = { href: string; variant?: Variant } & Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "href"
>;
type ButtonAsButton = { href?: undefined; variant?: Variant } & ComponentPropsWithoutRef<"button">;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  if (props.href !== undefined) {
    const { variant, className, ...rest } = props;
    return <Link className={buttonClasses(variant, className)} {...rest} />;
  }
  const { variant, className, type = "button", ...rest } = props;
  return (
    <button type={type} className={buttonClasses(variant, className)} {...rest} />
  );
}
