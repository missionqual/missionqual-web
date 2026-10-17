"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

export function MobileMenu({
  children,
  wrapperClassName,
  buttonClassName,
  panelClassName,
}: {
  children: ReactNode;
  wrapperClassName?: string;
  buttonClassName?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className={buttonClassName}
      >
        {open ? (
          <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="1" x2="18" y2="15" />
              <line x1="18" y1="1" x2="4" y2="15" />
            </g>
          </svg>
        ) : (
          <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="2" x2="21" y2="2" />
              <line x1="1" y1="8" x2="21" y2="8" />
              <line x1="1" y1="14" x2="21" y2="14" />
            </g>
          </svg>
        )}
      </button>
      <div
        id={panelId}
        hidden={!open}
        // Close after following any link in the panel.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className={panelClassName}
      >
        {children}
      </div>
    </div>
  );
}
