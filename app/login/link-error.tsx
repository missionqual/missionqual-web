"use client";

import { useSearchParams } from "next/navigation";
import s from "@/src/components/auth/auth.module.css";

export function LinkError() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "link_invalid") return null;
  return (
    <p role="alert" className={s.error} style={{ marginTop: 16 }}>
      That link didn&apos;t sign you in. If you just confirmed your email, it&apos;s confirmed: sign in below with
      your email and password. Otherwise, request a new link.
    </p>
  );
}
