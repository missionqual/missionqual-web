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
  /** The line under the heading; null for none. */
  text?: string | null;
  /** The current page, so Join and Sign in come back to it. */
  path: string;
  /** Shown to visitors above the locked card, e.g. the questions without their answers. */
  teaser?: ReactNode;
  children: ReactNode;
};

type LockedProps = Omit<Props, "children">;

/**
 * Members see the children. Visitors see a locked card with Join and Sign in,
 * never a blur over the real data: the children aren't rendered for them at all.
 * The static shell shows the locked card; a member's session swaps in the content.
 */
export function MembersOnly(props: Props) {
  return (
    <Suspense fallback={<Locked {...props} />}>
      <Gate {...props} />
    </Suspense>
  );
}

async function Gate({ children, ...props }: Props) {
  if (!(await getViewer())) return <Locked {...props} />;
  return <>{children}</>;
}

function Locked({ heading, text = "Join the community to see them.", path, teaser }: LockedProps) {
  const next = encodeURIComponent(path);
  return (
    <>
      {teaser}
      <div className={j.join}>
        <div className={s.text}>
          <span className={s.lock}>
            <LockIcon />
          </span>
          <div className={j.joinText}>
            <h3>{heading}</h3>
            {text && <p>{text}</p>}
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
    </>
  );
}
