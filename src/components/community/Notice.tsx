"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import s from "./community.module.css";

const NOTICES: Record<string, string> = {
  "password-updated": "Password updated.",
};

/** One-time notice from ?notice=; the param is dropped so a refresh doesn't repeat it. */
export function Notice() {
  const searchParams = useSearchParams();
  const [text] = useState(() => NOTICES[searchParams.get("notice") ?? ""]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("notice")) return;
    url.searchParams.delete("notice");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);

  if (!text) return null;
  return (
    <p role="status" className={s.notice}>
      {text}
    </p>
  );
}
