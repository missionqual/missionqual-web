"use client";

import { useSearchParams } from "next/navigation";

export function LinkError() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "link_invalid") return null;
  return (
    <p role="alert" className="mb-4 text-red-600">
      That sign-in link is invalid or has expired. Please try again.
    </p>
  );
}
