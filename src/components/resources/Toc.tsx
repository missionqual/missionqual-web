"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/src/lib/resources";
import s from "./article.module.css";

/** "On this page", marking the section being read. Desktop only (hidden on phones in CSS). */
export function Toc({ items }: { items: TocItem[] }) {
  const [current, setCurrent] = useState(items[0]?.id);

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    // The current section is the last heading above the top third of the screen.
    const update = () => {
      const line = window.innerHeight / 3;
      let id = targets[0].id;
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= line) id = el.id;
      }
      // At the very bottom, the last heading may never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        id = targets[targets.length - 1].id;
      }
      setCurrent(id);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return (
    <nav className={s.toc} aria-label="On this page">
      <p className={s.kick}>On this page</p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={item.id === current ? s.on : undefined}
          aria-current={item.id === current ? "location" : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
