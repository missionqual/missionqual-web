import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ArrowRight } from "@/src/components/landing/icons";
import j from "@/src/components/landing/Jobs.module.css";
import { getViewer } from "@/src/lib/community/viewer";
import { LockIcon } from "./icons";
import s from "./gate.module.css";

type Props = {
  /** What visitors are missing, e.g. "4 open jobs near this site". */
  heading: string;
  /** The current page, so Join and Sign in come back to it. */
  path: string;
  children: ReactNode;
};

/**
 * Members see the children. Visitors see a locked card with Join and Sign in,
 * never a blur over the real data: the children aren't rendered for them at all.
 * The static shell shows the locked card; a member's session swaps in the content.
 */
export function MembersOnly(props: Props) {
  return (
    <Suspense fallback={<Locked heading={props.heading} path={props.path} />}>
      <Gate {...props} />
    </Suspense>
  );
}

async function Gate({ heading, path, children }: Props) {
  if (!(await getViewer())) return <Locked heading={heading} path={path} />;
  return <>{children}</>;
}

function Locked({ heading, path }: { heading: string; path: string }) {
  const next = encodeURIComponent(path);
  return (
    <div className={j.join}>
      <div className={s.text}>
        <span className={s.lock}>
          <LockIcon />
        </span>
        <div className={j.joinText}>
          <h3>{heading}</h3>
          <p>Join the community to see them.</p>
        </div>
      </div>
      <div className={j.joinActs}>
        <Link href={`/signup?next=${next}`} className={j.joinBtn}>
          Join the community <ArrowRight width={14} height={11} />
        </Link>
        <p className={j.signin}>
          Already a member? <Link href={`/login?next=${next}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
