/** Set after a successful guide signup; gates /guide/thank-you. */
export const GUIDE_COOKIE = "mq_guide";

export const GUIDE_PDF = "/downloads/missionqual-transition-guide.pdf";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shared by the modal (inline error) and the server action. */
export function isValidEmail(email: string) {
  return email.length <= 254 && EMAIL_RE.test(email);
}
