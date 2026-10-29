"use client";

import { useTransition } from "react";
import { resolveReport, setCommentStatus, setPostStatus } from "@/app/community/moderation/actions";
import shared from "@/src/components/landing/shared.module.css";
import s from "./community.module.css";

/** Hide / Unhide the reported content, and Resolve the report. */
export function ReportActions({
  reportId,
  target,
  hidden,
  exists,
}: {
  reportId: string;
  target: { kind: "question" | "answer"; id: string };
  hidden: boolean;
  exists: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const toggleHidden = () =>
    startTransition(() =>
      target.kind === "question"
        ? setPostStatus(target.id, hidden ? "visible" : "hidden")
        : setCommentStatus(target.id, hidden ? "visible" : "hidden"),
    );
  return (
    <div className={s.rowEnd} style={{ marginTop: 16 }}>
      {exists && (
        <button type="button" className={s.btn2} disabled={pending} onClick={toggleHidden}>
          {hidden ? "Unhide" : "Hide"} {target.kind}
        </button>
      )}
      <button
        type="button"
        className={`${shared.btn} ${shared.btnSm}`}
        disabled={pending}
        onClick={() => startTransition(() => resolveReport(reportId))}
      >
        Resolve
      </button>
    </div>
  );
}
