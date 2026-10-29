import "server-only";
import { headers } from "next/headers";

// Absolute origin of the current request, used for auth email redirect links.
export async function getSiteUrl() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
