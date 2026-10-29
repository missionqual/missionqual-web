"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import t from "./tools.module.css";

type Props = { roles: { key: string; label: string; panel: ReactNode }[] };

/**
 * Role tabs (?role=) over panels the server already rendered, so switching is
 * instant and every role's questions are in the page. useSearchParams() sits
 * behind Suspense; the static shell shows the first role.
 */
export function RoleTabs(props: Props) {
  return (
    <Suspense fallback={<Tabs {...props} current={props.roles[0].key} path={null} />}>
      <UrlTabs {...props} />
    </Suspense>
  );
}

function UrlTabs(props: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const asked = params.get("role");
  const current = props.roles.some((r) => r.key === asked) ? asked! : props.roles[0].key;
  return <Tabs {...props} current={current} path={pathname} />;
}

function Tabs({ roles, current, path }: Props & { current: string; path: string | null }) {
  return (
    <div className={t.iq}>
      <nav aria-label="Roles">
        <ul className={t.chips}>
          {roles.map((r) => (
            <li key={r.key}>
              <Link
                href={`${path ?? ""}?role=${r.key}`}
                scroll={false}
                replace
                className={t.chip}
                aria-current={r.key === current ? "page" : undefined}
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {roles.map((r) => (
        <div key={r.key} hidden={r.key !== current}>
          {r.panel}
        </div>
      ))}
    </div>
  );
}
