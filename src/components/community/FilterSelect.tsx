"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import s from "./community.module.css";
import { SelectBox } from "./bits";

/** A filter <select> that writes ?{param}= (and resets paging) as soon as it changes. */
export function FilterSelect({
  param,
  value,
  options,
  label,
  className = "",
}: {
  param: string;
  value: string;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <SelectBox className={className}>
      <select
        className={s.sel}
        aria-label={label}
        value={value}
        disabled={pending}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) params.set(param, e.target.value);
          else params.delete(param);
          params.delete("page");
          const qs = params.toString();
          startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </SelectBox>
  );
}
