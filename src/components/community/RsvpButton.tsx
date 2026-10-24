"use client";

import { useTransition } from "react";
import { toggleRsvp } from "@/app/community/actions";
import shared from "@/src/components/landing/shared.module.css";
import s from "./community.module.css";
import { CalendarIcon, CheckIcon } from "./icons";

/** "Save my spot" ↔ "✓ You're in" + "Add to calendar". */
export function RsvpButton({
  sessionId,
  going,
  variant = "primary",
}: {
  sessionId: string;
  going: boolean;
  /** "secondary" is the full-width white button in the member-home sidebar. */
  variant?: "primary" | "secondary";
}) {
  const [pending, startTransition] = useTransition();
  const toggle = () => startTransition(() => toggleRsvp(sessionId));

  if (going) {
    return (
      <>
        <span className={s.going}>
          <CheckIcon /> You&rsquo;re in
        </span>
        <a className={s.link} href={`/community/sessions/${sessionId}/ics`} download>
          <CalendarIcon /> Add to calendar
        </a>
        <button type="button" className={s.quiet} onClick={toggle} disabled={pending}>
          {pending ? "Cancelling…" : "Cancel"}
        </button>
      </>
    );
  }
  return (
    <button
      type="button"
      className={variant === "primary" ? `${shared.btn} ${shared.btnSm}` : `${s.btn2} ${s.fullWidth}`}
      onClick={toggle}
      disabled={pending}
    >
      {pending ? "Saving…" : "Save my spot"}
    </button>
  );
}
