/** Set after a successful guide signup; gates /guide/thank-you. */
export const GUIDE_COOKIE = "mq_guide";

export const GUIDE_PDF = "/downloads/missionqual-transition-guide.pdf";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shared by the modal (inline error) and the server action. */
export function isValidEmail(email: string) {
  return email.length <= 254 && EMAIL_RE.test(email);
}

/** Throwaway inboxes. The guide goes to the address too, so these are refused. */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "maildrop.cc",
  "dispostable.com",
  "throwawaymail.com",
]);

export const emailDomain = (email: string) => email.slice(email.lastIndexOf("@") + 1).toLowerCase();

export function isDisposableEmail(email: string) {
  return DISPOSABLE_DOMAINS.has(emailDomain(email));
}

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "live.com",
  "msn.com",
];

/** Real providers one or two letters away from a common one; never "corrected". */
const REAL_DOMAINS = new Set(["mail.com", "gmx.com", "me.com", "mac.com", "aim.com", "ymail.com", "live.ca", "msn.ca"]);

/** Edit distance where swapping two neighbors ("gmial") counts as one edit. */
function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/**
 * "name@gmial.com" → "name@gmail.com" when the domain is a close miss of a
 * common one; otherwise null. One edit away for short domains (aol.com),
 * up to two for longer ones (hotmail.com).
 */
export function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const domain = email.slice(at + 1).toLowerCase();
  if (!domain || COMMON_DOMAINS.includes(domain) || REAL_DOMAINS.has(domain)) return null;

  let best: { domain: string; d: number } | null = null;
  for (const candidate of COMMON_DOMAINS) {
    const d = distance(domain, candidate);
    const allowed = candidate.length >= 9 ? 2 : 1;
    if (d <= allowed && (!best || d < best.d)) best = { domain: candidate, d };
  }
  return best ? `${email.slice(0, at)}@${best.domain}` : null;
}
