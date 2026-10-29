"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type RefObject,
  type ReactNode,
} from "react";
import { submitGuideEmail } from "@/app/guide/actions";
import { CTA_LABEL } from "@/src/components/landing/CtaButton";
import { ArrowRight } from "@/src/components/landing/icons";
import shared from "@/src/components/landing/shared.module.css";
import { isValidEmail, suggestEmail } from "@/src/lib/guide";
import s from "./GuideCaptureModal.module.css";

type OpenGuide = (trigger?: HTMLElement | null) => void;

const GuideCaptureContext = createContext<OpenGuide | null>(null);

/** Marks the history entry pushed on open, so the phone's back button closes the modal. */
const HISTORY_KEY = "mqGuideModal";

/** Opens the shared "send me the guide" modal. Pass the clicked element so focus returns to it. */
export function useGuideCapture() {
  const open = useContext(GuideCaptureContext);
  if (!open) throw new Error("useGuideCapture must be used inside <GuideCaptureProvider>");
  return open;
}

const ERRORS = {
  invalid: "Enter your full email address, like name@gmail.com.",
  disposable: "Use an email you check. We'll send the guide there too.",
  domain: "That email domain doesn't look right. Check the spelling.",
  server: "Something went wrong. Try again.",
} as const;

/** Effects that run on every navigation. */
function RouteEffects({ open, dialogRef }: { open: OpenGuide; dialogRef: RefObject<HTMLDialogElement | null> }) {
  const pathname = usePathname();

  // ?guide=1 (the /guide redirect, the thank-you gate) opens the modal on arrival.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("guide") !== "1") return;
    url.searchParams.delete("guide");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    open(null);
  }, [pathname, open]);

  // Close before leaving for the thank-you page so scroll is unlocked there.
  useEffect(() => {
    if (pathname === "/guide/thank-you" && dialogRef.current?.open) dialogRef.current.close();
  }, [pathname, dialogRef]);

  return null;
}

export function GuideCaptureProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  /** Path the modal opened on; after a redirect away (thank-you) we must not go back. */
  const openPathRef = useRef<string | null>(null);
  const [error, setError] = useState<keyof typeof ERRORS | null>(null);
  /** "Did you mean name@gmail.com?" for a close miss of a common domain. */
  const [suggestion, setSuggestion] = useState<string | null>(null);
  /** The address a suggestion was already offered for; submitting it again goes through. */
  const offeredForRef = useRef<string | null>(null);
  const [referrer, setReferrer] = useState("");
  const [pending, startTransition] = useTransition();

  const open = useCallback<OpenGuide>((trigger) => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setError(null);
    setSuggestion(null);
    offeredForRef.current = null;
    setReferrer(window.location.pathname);
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    // Same tap as the click, so phones raise the keyboard with the card above it.
    inputRef.current?.focus();
    // A history entry for the back button; spread keeps Next's router state.
    openPathRef.current = window.location.pathname;
    window.history.pushState({ ...window.history.state, [HISTORY_KEY]: true }, "");
  }, []);

  // Back button while open: the entry is already popped, so just close.
  useEffect(() => {
    const onPop = () => {
      if (!dialogRef.current?.open) return;
      openPathRef.current = null;
      dialogRef.current.close();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Fires for Esc, the X, a backdrop click and the redirect after submit.
  const onClose = () => {
    document.documentElement.style.overflow = "";
    // Closed with Esc, X or backdrop: drop our history entry. Skipped after the
    // back button (already popped) and after the redirect to /guide/thank-you.
    const openPath = openPathRef.current;
    openPathRef.current = null;
    if (openPath === window.location.pathname && window.history.state?.[HISTORY_KEY]) window.history.back();
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger?.isConnected) trigger.focus();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      setError("invalid");
      inputRef.current?.focus();
      return;
    }
    // A likely typo: offer the fix once. Submitting the same address again sends it as typed.
    const fix = suggestEmail(email);
    if (fix && offeredForRef.current !== email) {
      offeredForRef.current = email;
      setSuggestion(fix);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setSuggestion(null);
    startTransition(async () => {
      try {
        // Redirects to /guide/thank-you on success; only returns on failure.
        const result = await submitGuideEmail(formData);
        if (result?.error) setError(result.error);
      } catch {
        setError("server");
      }
    });
  };

  const offerFix = (value: string) => {
    const email = value.trim().toLowerCase();
    const fix = isValidEmail(email) ? suggestEmail(email) : null;
    if (fix) offeredForRef.current = email;
    setSuggestion(fix);
  };

  const applyFix = () => {
    if (!suggestion || !inputRef.current) return;
    inputRef.current.value = suggestion;
    setSuggestion(null);
    setError(null);
    inputRef.current.focus();
  };

  return (
    <GuideCaptureContext value={open}>
      {children}
      {/* usePathname() must sit behind Suspense on dynamic routes ([id] pages). */}
      <Suspense fallback={null}>
        <RouteEffects open={open} dialogRef={dialogRef} />
      </Suspense>
      <dialog
        ref={dialogRef}
        className={s.dialog}
        aria-labelledby="guide-capture-label"
        onClose={onClose}
        // The dialog box is padding-free, so a click on the dialog itself is the backdrop.
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className={s.card}>
          <button
            type="button"
            className={s.close}
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {/* noValidate: show our inline error instead of the browser bubble. */}
          <form className={s.form} onSubmit={onSubmit} noValidate>
            <label id="guide-capture-label" htmlFor="guide-capture-email" className={s.label}>
              Where should we send your guide?
            </label>
            <div className={s.field}>
              <input
                ref={inputRef}
                id="guide-capture-email"
                className={s.input}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="go"
                readOnly={pending}
                required
                placeholder="you@email.com"
                aria-invalid={error !== null && error !== "server"}
                aria-describedby="guide-capture-error guide-capture-suggestion"
                onChange={() => {
                  if (error) setError(null);
                  if (suggestion) setSuggestion(null);
                  offeredForRef.current = null;
                }}
                onBlur={(e) => offerFix(e.target.value)}
              />
              <p id="guide-capture-error" className={s.error} aria-live="polite">
                {error && (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7.5v5.5M12 16.5h.01" />
                    </svg>
                    <span>{ERRORS[error]}</span>
                  </>
                )}
              </p>
              <p id="guide-capture-suggestion" className={s.suggest} aria-live="polite">
                {suggestion && (
                  <button type="button" onClick={applyFix}>
                    Did you mean <b>{suggestion}</b>?
                  </button>
                )}
              </p>
            </div>
            {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
            <input
              className={s.honeypot}
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <input type="hidden" name="referrer" value={referrer} />
            <button type="submit" className={`${shared.btn} ${s.submit}`} disabled={pending}>
              {pending ? (
                <>
                  <span className={s.spin} aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <>
                  {CTA_LABEL}
                  <ArrowRight width={16} height={12} />
                </>
              )}
            </button>
          </form>
        </div>
      </dialog>
    </GuideCaptureContext>
  );
}
