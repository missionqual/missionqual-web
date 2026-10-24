"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

type Props = { href: string; className?: string; activeClassName: string; children: ReactNode };

/**
 * A header nav link that marks itself current on its own section. usePathname()
 * must sit behind Suspense on dynamic routes, so the shell renders it unmarked.
 */
export function NavLink(props: Props) {
  return (
    <Suspense
      fallback={
        <Link href={props.href} className={props.className}>
          {props.children}
        </Link>
      }
    >
      <ActiveLink {...props} />
    </Suspense>
  );
}

function ActiveLink({
  href,
  className = "",
  activeClassName,
  children,
}: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} className={`${className} ${active ? activeClassName : ""}`} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
