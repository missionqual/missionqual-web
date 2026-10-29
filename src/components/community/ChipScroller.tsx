"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import s from "./community.module.css";

/** A single row of chips that scrolls sideways on phones, with the active chip scrolled into view. */
export function ChipScroller({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = ref.current;
    const active = row?.querySelector<HTMLElement>("[aria-current]");
    if (!row || !active || row.scrollWidth <= row.clientWidth) return;
    // Scroll the row only (scrollIntoView could also move the page).
    const pad = 16;
    const left = active.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft;
    const right = left + active.offsetWidth;
    if (left - pad < row.scrollLeft) row.scrollLeft = left - pad;
    else if (right + pad * 3 > row.scrollLeft + row.clientWidth) row.scrollLeft = right + pad * 3 - row.clientWidth;
  }, []);

  return (
    <div ref={ref} className={`${s.chips} ${s.chipsScroll}`} style={style}>
      {children}
    </div>
  );
}
