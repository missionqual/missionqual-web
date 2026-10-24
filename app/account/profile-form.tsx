"use client";

import { useActionState, useState } from "react";
import c from "@/src/components/community/community.module.css";
import s from "@/src/components/auth/auth.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { ABOUT_MAX, DC_STATUS, DISCIPLINES, type DcStatus } from "@/src/lib/community/constants";
import { updateProfile, type ProfileFormState } from "./actions";

export type Profile = {
  display_name: string | null;
  job_title: string | null;
  dc_status: string | null;
  years_experience: number | null;
  certifications: string[] | null;
  disciplines: string[] | null;
  location: string | null;
  came_from: string | null;
  about: string | null;
  email_on_reply: boolean;
};

const initialState: ProfileFormState = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  const [certs, setCerts] = useState(profile.certifications?.join(", ") ?? "");
  const [about, setAbout] = useState(profile.about ?? "");
  // Keep any older free-text disciplines selectable so saving doesn't drop them.
  const disciplineOptions = [...new Set([...DISCIPLINES, ...(profile.disciplines ?? [])])];
  const certChips = certs
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  return (
    <form action={action} className={s.form}>
      <div>
        <label className={s.label} htmlFor="pf-name">
          Full name
        </label>
        <input id="pf-name" className={s.input} name="display_name" defaultValue={profile.display_name ?? ""} required autoComplete="name" />
      </div>
      <div>
        <label className={s.label} htmlFor="pf-title">
          Current or last role
        </label>
        <input id="pf-title" className={s.input} name="job_title" defaultValue={profile.job_title ?? ""} placeholder="API 570 inspector" />
      </div>
      <fieldset className={s.fieldset}>
        <legend className={s.label}>Where you are now</legend>
        <div className={s.radios}>
          {(Object.keys(DC_STATUS) as DcStatus[]).map((key) => (
            <label key={key}>
              <input className={s.radioInput} type="radio" name="dc_status" value={key} defaultChecked={profile.dc_status === key} />
              <span className={s.radioCard}>{DC_STATUS[key]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className={s.label} htmlFor="pf-years">
          Years of experience
        </label>
        <input
          id="pf-years"
          className={s.input}
          name="years_experience"
          type="number"
          min={0}
          max={70}
          step={1}
          inputMode="numeric"
          defaultValue={profile.years_experience ?? ""}
        />
      </div>
      <div>
        <label className={s.label} htmlFor="pf-certs">
          Certifications
        </label>
        <input
          id="pf-certs"
          className={s.input}
          name="certifications"
          value={certs}
          onChange={(e) => setCerts(e.target.value)}
          placeholder="API 570, CWI, OSHA 30"
          aria-describedby="pf-certs-help"
        />
        <p id="pf-certs-help" className={s.help}>
          Separate them with commas.
        </p>
        {certChips.length > 0 && (
          <div className={`${c.tags} ${s.preview}`} aria-hidden="true">
            {certChips.map((x, i) => (
              <span key={`${x}-${i}`} className={c.tagGrey}>
                {x}
              </span>
            ))}
          </div>
        )}
      </div>
      <fieldset className={s.fieldset}>
        <legend className={s.label}>Disciplines</legend>
        <div className={c.chips}>
          {disciplineOptions.map((d) => (
            <label key={d}>
              <input className={c.chipInput} type="checkbox" name="disciplines" value={d} defaultChecked={profile.disciplines?.includes(d)} />
              <span className={c.chip}>{d}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className={s.label} htmlFor="pf-location">
          Location
        </label>
        <input id="pf-location" className={s.input} name="location" defaultValue={profile.location ?? ""} placeholder="City, ST" autoComplete="address-level2" />
      </div>
      <div>
        <label className={s.label} htmlFor="pf-came-from">
          Came from
        </label>
        <input
          id="pf-came-from"
          className={s.input}
          name="came_from"
          defaultValue={profile.came_from ?? ""}
          maxLength={200}
          placeholder="Refinery and LNG turnarounds, Gulf Coast"
        />
      </div>
      <div>
        <label className={s.label} htmlFor="pf-about">
          About
        </label>
        <textarea
          id="pf-about"
          className={s.input}
          name="about"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          maxLength={ABOUT_MAX}
          aria-describedby="pf-about-count"
        />
        <p id="pf-about-count" className={s.counter}>
          {about.length}/{ABOUT_MAX}
        </p>
      </div>
      <label className={s.toggle}>
        Email me when someone replies
        <input className={s.switch} type="checkbox" role="switch" name="email_on_reply" defaultChecked={profile.email_on_reply} />
      </label>
      {state.error && (
        <p role="alert" className={s.error}>
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className={s.status}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${shared.btn} ${s.submit}`}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
