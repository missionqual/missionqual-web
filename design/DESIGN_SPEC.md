# MissionQual Landing — Design Spec (handoff for Claude Code)

`missionqual-landing.html` is the reference implementation: one responsive page,
mobile-first, desktop layout at `min-width: 1024px`. Port it into the Next.js app
component-by-component; every token, size and behavior below is already in that file.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--navy` | `#141C33` | hero/final-CTA bg, headings, button text |
| `--navy-deep` | `#0E1527` | ticker + footer bg |
| `--teal` | `#57BCB3` | the ONE button fill; accent text on dark |
| `--teal-dark` | `#2E7D74` | accent text/links on light (AA) |
| `--teal-ink` | `#1f5a53` | emphasized text inside tint fills |
| `--tint` | `#EFFAF8` | highlight row, "why it may fit" boxes |
| `--paper` | `#F4F6FA` | page background |
| `--card` | `#F8FAFD` | guide cards on white |
| `--cover` | `#EDF1F7` | flat guide cover |
| `--line` / `--line-strong` | `#E6EAF2` / `#E0E5EF` | hairlines / card borders |
| `--ink` / `--ink-soft` / `--ink-faint` | `#141C33` / `#4A5572` / `#7E8AA6` | text on light |
| `--dark-soft` / `--dark-faint` / `--dark-link` | `#B9C2D6` / `#8D98B2` / `#D7DDEA` | text on dark |

Fonts (Google): **Space Grotesk** 500/600/700 (display), **IBM Plex Sans**
400–700 (body), **IBM Plex Mono** 500 (eyebrows, ticker, numbers, meta).

## Non-negotiable design rules

1. **One CTA style.** Every call-to-action is the same solid teal button
   (`--teal` fill, navy text, 8px radius, 50–58px tall), same label:
   **"Send me the free guide →"** (header variant: "Get the free guide").
   Never an underlined text link as a CTA; underlined/arrow links are for
   secondary navigation only ("See the full sheet", "View posting").
2. **Mobile fold order:** flat guide cover → headline → one-line subhead →
   full-width button. All four inside the first viewport. **No subtext under
   the hero CTA.** No email-reassurance copy (that the guide is free in a
   single email, or that it is spam-free) appears anywhere on the page,
   including under the final CTA.
3. **Hero image is the flat cover, not a 3D render.** `--cover` card, 5px
   (mobile) / 8px (desktop) teal left border, mono kicker, display title,
   3–4 placeholder bars, wordmark bottom-left.
4. **Translation chip (desktop only):** white card hanging off the cover's
   **bottom-right** corner ("FROM THE TRANSLATION SHEET / Process unit → Data
   hall"). Never on mobile; never positioned where it covers the wordmark.
5. **Translation Sheet is the first section after the hero.** Row order is
   fixed: **10-week turnaround → Multi-year campus build** first, highlighted with `--tint`; then ITPs → **Witnessed Cx tests —
   FWT, SAT & L4 scripts**; Mechanical completion → Commissioning levels L1–L5;
   Process unit → Data hall. Left column plain, right column 600-weight
   `--teal-ink`.
6. **Audience list appears exactly once**: the rolling ticker. Not in the hero
   subhead, not repeated in the footer.
7. **Nav (desktop):** Jobs · Resources · Community · About · **Sign in** (white,
   600 weight, plain text — not a second button) · teal button. **No
   "Transition Guide" nav tab** (the button is that destination). Footer is a
   sitemap and may list Transition Guide + Community + Sign in.
8. **Jobs section:** exactly 3 cards on the homepage, each with location,
   **real posted date**, title, company·city, a `--tint` "Why it may fit" line,
   and "View posting ↗". Heading is "Recent data center jobs" — only change to
   "this week" if the feed truly updates weekly. Current card content is
   placeholder; wire to real postings. Jobs header on mobile: title on one
   line, "See all jobs →" directly below it. On desktop: title left, link
   right, same line.

9. **Section spacing:** All content sections use `padding-block:
   var(--section-y)` (48px mobile / 80px desktop). There are no per-section
   overrides.

## Behavior

- **Ticker:** single line, duplicated span, `translateX(0 → -50%)` loop
  (26s mobile / 32s desktop), scrolls **right-to-left**, fade masks on both
  edges, pauses on hover, static under `prefers-reduced-motion`.
- **Mobile sticky CTA bar:** fixed bottom, white 96% bg, top hairline + up
  shadow, full-width button, `env(safe-area-inset-bottom)` padding. Visibility
  (IntersectionObserver): hidden while the hero CTA is in view, hidden while
  the final CTA section is in view, shown otherwise — **never two CTAs on
  screen at once**. Hidden entirely ≥1024px (the header button covers desktop).
- Smooth scroll for in-page anchors; final CTA button should become the real
  email-capture form.

## Breakpoints & layout

- `<1024px`: single column, 20px side gutters, centered hero, stacked cards.
- `≥1024px`: `.wrap` max-width 1248px; hero splits copy (max 640px) left /
  cover (360px + chip) right; translation section = 400px copy column + fluid
  table; guide cards and job cards = `repeat(3, minmax(0,1fr))` grids with
  24px gap; footer = brand left, EXPLORE/LEGAL columns right.

## Accessibility

- Real `<a>`/`<button>` elements only; `aria-label` on the icon-only menu
  button; decorative SVGs `aria-hidden="true"`; table uses `<th scope="col">`.
- Contrast pairs already pass AA: navy-on-teal buttons, `--teal-dark` on light,
  `--dark-soft` on navy. Don't lighten them.
- Honor `prefers-reduced-motion` for the ticker and sticky-bar transition.
