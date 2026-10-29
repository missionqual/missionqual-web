import { Children, isValidElement, type ReactNode } from "react";
import { slugify } from "@/src/lib/resources";
import s from "./article.module.css";

/** Plain text of a node tree, for heading ids. */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/** ## headings get an id so "On this page" can link to them. */
export function H2({ children }: { children?: ReactNode }) {
  return <h2 id={slugify(textOf(children))}>{children}</h2>;
}

/** The summary box at the top of an article. */
export function ShortVersion({ children }: { children: ReactNode }) {
  return (
    <div className={s.short} id="short">
      <p className={s.kick}>The short version</p>
      {children}
    </div>
  );
}

/** A table that scrolls sideways on phones. Children are <thead> and <tbody>. */
export function ScrollTable({ children }: { children: ReactNode }) {
  return (
    <div className={s.tbl} role="region" aria-label="Table" tabIndex={0}>
      <table>{Children.toArray(children).filter(isValidElement)}</table>
    </div>
  );
}

/** The teal "If you're coming from oil and gas" box. */
export function FromOilAndGas({ children }: { children: ReactNode }) {
  return (
    <aside className={s.og}>
      <p className={s.kick}>If you&apos;re coming from oil and gas</p>
      {children}
    </aside>
  );
}

/**
 * A yellow slot for copy still to write, e.g. "[Chidi: a line from your own
 * site]". Shows in development; renders nothing in production, so a slot left
 * in a published article never reaches readers.
 */
export function Placeholder({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <p>
      <span className={s.slot}>{children}</span>
    </p>
  );
}
