import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "@/src/components/landing/icons";
import shared from "@/src/components/landing/shared.module.css";
import { getViewer } from "@/src/lib/community/viewer";
import s from "./resources.module.css";

type Props = {
  title: string;
  text?: string;
  /** Where Join and Sign in come back to, e.g. "/resources". */
  back: string;
};

/**
 * The light teal "ask the community" box at the end of /resources and each
 * article. Visitors (and the static shell) get Join + Sign in; members get a
 * link to ask their question.
 */
export function CommunityBox(props: Props) {
  return (
    <div className={shared.wrap}>
      <Suspense fallback={<Box {...props} member={false} />}>
        <ViewerBox {...props} />
      </Suspense>
    </div>
  );
}

async function ViewerBox(props: Props) {
  return <Box {...props} member={Boolean(await getViewer())} />;
}

function Box({ title, text, back, member }: Props & { member: boolean }) {
  const next = encodeURIComponent(back);
  return (
    <div className={s.ask}>
      <div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      <div className={s.acts}>
        {member ? (
          <Link href="/community/ask" className={s.btnO}>
            Ask in the community <ArrowRight width={14} height={11} />
          </Link>
        ) : (
          <>
            <Link href={`/signup?next=${next}`} className={s.btnO}>
              Join the community <ArrowRight width={14} height={11} />
            </Link>
            <p className={s.si}>
              Already a member? <Link href={`/login?next=${next}`}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
