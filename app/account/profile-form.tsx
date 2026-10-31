"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import a from "@/src/components/auth/auth.module.css";
import { ArrowRight } from "@/src/components/landing/icons";
import shared from "@/src/components/landing/shared.module.css";
import o from "@/src/components/community/onboarding.module.css";
import { ABOUT_MAX, DC_STATUS, INDUSTRIES, REQUIRED_MESSAGES, type DcStatus } from "@/src/lib/community/constants";
import { REQUIRED_PROFILE_FIELDS, requiredFilled } from "@/src/lib/community/format";
import { saveProfile, type ProfileField, type ProfileFormState } from "./actions";

export type Profile = {
  display_name: string | null;
  job_title: string | null;
  industry: string | null;
  dc_status: string | null;
  location: string | null;
  years_experience: number | null;
  certifications: string[] | null;
  about: string | null;
  email_on_reply: boolean;
};

/** The second line on each "Where you are now" card. */
const DC_STATUS_HINT: Record<DcStatus, string> = {
  on_site: "Already working on one",
  making_move: "Looking for my first one",
};

type Props =
  | { mode: "welcome"; profile: Profile; firstName: string; dest: string; email?: never; memberId?: never }
  | { mode: "edit"; profile: Profile; email: string | null; memberId: string; firstName?: never; dest?: never };

const initialState: ProfileFormState = {};

/** The teal asterisk after a required field's label. */
function Req() {
  return (
    <span className={o.req} aria-hidden="true">
      *
    </span>
  );
}

/**
 * The profile card on /welcome (design/onboarding/profile-setup.html) and
 * /account: same fields in the same order, different header and button.
 */
export function ProfileForm(props: Props) {
  const { mode, profile } = props;
  const [state, action, pending] = useActionState(saveProfile, initialState);
  // Controlled, so the progress bar follows along and nothing clears after a failed save.
  const [v, setV] = useState({
    display_name: profile.display_name ?? "",
    job_title: profile.job_title ?? "",
    industry: profile.industry ?? "",
    dc_status: profile.dc_status ?? "",
    location: profile.location ?? "",
    years_experience: profile.years_experience?.toString() ?? "",
    certifications: profile.certifications?.join(", ") ?? "",
    about: profile.about ?? "",
  });
  const [emailOnReply, setEmailOnReply] = useState(profile.email_on_reply);
  const [clientErrors, setClientErrors] = useState<ProfileFormState["errors"]>({});
  // Server errors show until the next submit; a field's error clears once it's edited.
  const [touched, setTouched] = useState<Set<ProfileField>>(new Set());

  const filled = requiredFilled({ ...v, years_experience: null, certifications: null });
  const errorFor = (f: ProfileField) => (touched.has(f) ? undefined : (clientErrors?.[f] ?? state.errors?.[f]));
  const set = (f: keyof typeof v) => (value: string) => {
    setV((x) => ({ ...x, [f]: value }));
    setTouched((t) => new Set(t).add(f as ProfileField));
  };
  // "Saved." stays until the next edit.
  const saved = mode === "edit" && state.saved && touched.size === 0;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const errors: ProfileFormState["errors"] = {};
    for (const f of Object.keys(REQUIRED_MESSAGES) as (keyof typeof REQUIRED_MESSAGES)[]) {
      if (!v[f].trim()) errors[f] = REQUIRED_MESSAGES[f];
    }
    setClientErrors(errors);
    setTouched(new Set());
    const first = Object.keys(errors)[0];
    if (first) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
    }
  }

  const err = (f: ProfileField) => {
    const msg = errorFor(f);
    return msg ? (
      <p id={`pf-${f}-err`} className={o.err}>
        {msg}
      </p>
    ) : null;
  };
  const inputProps = (f: ProfileField) => ({
    "data-field": f,
    "aria-invalid": errorFor(f) ? true : undefined,
    "aria-describedby": errorFor(f) ? `pf-${f}-err` : undefined,
  });

  return (
    <>
      <div className={o.top}>
        {mode === "welcome" ? (
          <>
            <p className={o.kick}>Set up your profile</p>
            <h1>Welcome to MissionQual, {props.firstName}.</h1>
            <p>Two minutes, so members know who they&rsquo;re answering. You can change any of this later.</p>
            <div className={o.prog}>
              <span aria-hidden="true">Profile</span>
              <span
                className={o.bar}
                role="progressbar"
                aria-label="Required fields filled"
                aria-valuemin={0}
                aria-valuemax={REQUIRED_PROFILE_FIELDS}
                aria-valuenow={filled}
              >
                <i style={{ width: `${(filled / REQUIRED_PROFILE_FIELDS) * 100}%` }} />
              </span>
              <span>
                {filled} of {REQUIRED_PROFILE_FIELDS} required
              </span>
            </div>
          </>
        ) : (
          <>
            <h1>Edit profile</h1>
            <p>Signed in as {props.email}</p>
          </>
        )}
      </div>

      <form action={action} onSubmit={onSubmit} className={o.form} noValidate>
        <input type="hidden" name="mode" value={mode} />
        {mode === "welcome" && <input type="hidden" name="dest" value={props.dest} />}

        <section className={o.grp} aria-labelledby="pf-g1">
          <div className={o.gh}>
            <h2 id="pf-g1">About your work</h2>
            <span>
              <span className={o.reqMark}>*</span> Required
            </span>
          </div>
          <div className={o.row2}>
            <div className={o.f}>
              <label htmlFor="pf-name">
                Full name
                <Req />
              </label>
              <input
                id="pf-name"
                className={o.inp}
                name="display_name"
                value={v.display_name}
                onChange={(e) => set("display_name")(e.target.value)}
                autoComplete="name"
                required
                {...inputProps("display_name")}
              />
              {err("display_name")}
            </div>
            <div className={o.f}>
              <label htmlFor="pf-role">
                Current or most recent role
                <Req />
              </label>
              <input
                id="pf-role"
                className={o.inp}
                name="job_title"
                value={v.job_title}
                onChange={(e) => set("job_title")(e.target.value)}
                placeholder="e.g. QA/QC inspector"
                required
                {...inputProps("job_title")}
              />
              {err("job_title")}
            </div>
          </div>
          <div className={o.f}>
            <label htmlFor="pf-industry">
              Your current or most recent industry
              <Req />
            </label>
            <select
              id="pf-industry"
              className={o.inp}
              name="industry"
              value={v.industry}
              onChange={(e) => set("industry")(e.target.value)}
              required
              {...inputProps("industry")}
            >
              <option value="" disabled>
                Choose one
              </option>
              {INDUSTRIES.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
            {err("industry")}
          </div>
          <div className={o.f}>
            <fieldset aria-describedby={errorFor("dc_status") ? "pf-dc_status-err" : undefined}>
              <legend>
                Where you are now
                <Req />
              </legend>
              <div className={o.seg}>
                {(Object.keys(DC_STATUS) as DcStatus[]).map((key, i) => (
                  <label key={key}>
                    <input
                      type="radio"
                      name="dc_status"
                      value={key}
                      checked={v.dc_status === key}
                      onChange={() => set("dc_status")(key)}
                      required
                      {...(i === 0 ? { "data-field": "dc_status" } : {})}
                      data-invalid={errorFor("dc_status") ? "" : undefined}
                    />
                    <span className={o.dot} aria-hidden="true" />
                    <span>
                      {DC_STATUS[key]}
                      <small>{DC_STATUS_HINT[key]}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {err("dc_status")}
          </div>
          <div className={o.f}>
            <label htmlFor="pf-location">
              Location
              <Req />
            </label>
            <input
              id="pf-location"
              className={o.inp}
              name="location"
              value={v.location}
              onChange={(e) => set("location")(e.target.value)}
              placeholder="City, ST"
              autoComplete="address-level2"
              required
              {...inputProps("location")}
            />
            {err("location")}
          </div>
        </section>

        <section className={o.grp} aria-labelledby="pf-g2">
          <div className={o.gh}>
            <h2 id="pf-g2">Help people give you better answers</h2>
            <span>Optional</span>
          </div>
          <div className={o.row2}>
            <div className={o.f}>
              <label htmlFor="pf-years">Years of experience</label>
              <input
                id="pf-years"
                className={o.inp}
                name="years_experience"
                value={v.years_experience}
                onChange={(e) => set("years_experience")(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 10"
                {...inputProps("years_experience")}
              />
              {err("years_experience")}
            </div>
            <div className={o.f}>
              <label htmlFor="pf-certs">Certifications</label>
              <input
                id="pf-certs"
                className={o.inp}
                name="certifications"
                value={v.certifications}
                onChange={(e) => set("certifications")(e.target.value)}
                placeholder="e.g. API 570, CWI, OSHA 30"
                aria-describedby="pf-certs-help"
              />
              <p id="pf-certs-help" className={o.help}>
                Separate them with commas.
              </p>
            </div>
          </div>
          <div className={o.f}>
            <label htmlFor="pf-about">About you</label>
            <textarea
              id="pf-about"
              className={o.inp}
              name="about"
              value={v.about}
              onChange={(e) => set("about")(e.target.value)}
              maxLength={ABOUT_MAX}
              placeholder="e.g. 12 years as an API 570 inspector on refinery turnarounds. Looking for my first data center QA/QC role."
              {...inputProps("about")}
            />
            {err("about")}
          </div>
          <label className={o.toggle}>
            Email me when someone replies to me
            <input
              className={a.switch}
              type="checkbox"
              role="switch"
              name="email_on_reply"
              checked={emailOnReply}
              onChange={(e) => setEmailOnReply(e.target.checked)}
            />
          </label>
        </section>

        {state.error && (
          <p role="alert" className={o.err}>
            {state.error}
          </p>
        )}

        {mode === "welcome" ? (
          <div className={o.acts}>
            <Link className={o.skip} href={props.dest}>
              <u>Skip for now</u>
            </Link>
            <button type="submit" className={shared.btn} disabled={pending}>
              Enter the community <ArrowRight width={14} height={11} />
            </button>
          </div>
        ) : (
          <div className={o.acts}>
            {saved ? (
              <p role="status" className={o.saved}>
                Saved. <Link href="/community">Back to the community</Link>
                <Link href={`/community/members/${props.memberId}`}>View your profile</Link>
              </p>
            ) : (
              <span />
            )}
            <button type="submit" className={shared.btn} disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </form>
    </>
  );
}
