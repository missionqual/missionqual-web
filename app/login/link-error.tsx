"use client";

import { useSearchParams } from "next/navigation";
import s from "@/src/components/auth/auth.module.css";

export function LinkError() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "link_invalid") return null;
  return (
    <p role="alert" className={s.error} style={{ marginTop: 16 }}>
      That sign-in link is invalid or has expired. Please try again.
    </p>
  );
}
