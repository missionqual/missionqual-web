"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import s from "./community.module.css";
import { SearchIcon } from "./icons";
import m from "./members.module.css";

/** Search by name, role or cert. Updates ?q= after a short pause in typing. */
export function MemberSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
    // Only re-run when the typed value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form role="search" className={m.search} onSubmit={(e) => e.preventDefault()}>
      <span className={m.searchIcon}>
        <SearchIcon />
      </span>
      <input
        className={`${s.inp} ${m.searchInput}`}
        type="search"
        aria-label="Search members"
        placeholder="Search by name, role or cert"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
