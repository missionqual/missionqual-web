import "server-only";
import { Resolver } from "node:dns/promises";

const TIMEOUT_MS = 2000;

/** Codes that mean "this domain has no such records", as opposed to a DNS failure. */
const MISSING = new Set(["ENOTFOUND", "ENODATA"]);

/**
 * Whether an email domain can receive mail: MX records, or failing that an
 * address (A) record. "missing" only when DNS answered that neither exists;
 * any DNS error or timeout counts as "ok", so a hiccup never blocks a person.
 */
export async function checkEmailDomain(domain: string): Promise<"ok" | "missing"> {
  const resolver = new Resolver({ timeout: TIMEOUT_MS, tries: 1 });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<"ok">((resolve) => {
    timer = setTimeout(() => resolve("ok"), TIMEOUT_MS);
  });

  const lookup = (async (): Promise<"ok" | "missing"> => {
    try {
      const mx = await resolver.resolveMx(domain);
      if (mx.length > 0) return "ok";
    } catch (err) {
      if (!MISSING.has((err as NodeJS.ErrnoException).code ?? "")) return "ok";
    }
    try {
      const a = await resolver.resolve4(domain);
      return a.length > 0 ? "ok" : "missing";
    } catch (err) {
      return MISSING.has((err as NodeJS.ErrnoException).code ?? "") ? "missing" : "ok";
    }
  })();

  try {
    return await Promise.race([lookup, timeout]);
  } finally {
    clearTimeout(timer);
    resolver.cancel();
  }
}
