# MissionQual Community, version 1: build spec

Read this whole file before writing code. Also read `design/DESIGN_SPEC.md` (its rules still apply) and open the designs in `design/community/`. Each design file is responsive: check it at 1440px and at 390px.

| Design file | Route |
|---|---|
| `join.html` | `/community` when signed out |
| `home.html` | `/community` when signed in |
| `question.html` | `/community/questions/[id]` |
| `ask.html` | `/community/ask` |
| `jobs.html` | `/community/jobs` |
| `sessions.html` | `/community/sessions` |
| `members.html` | `/community/members` |
| `profile.html` | `/community/members/[id]` |

The design files are plain HTML/CSS with placeholder people and numbers. Port them into the existing setup: the `globals.css` tokens, `shared.module.css` (`.btn`, `.wrap`, `.h2`), the `CtaButton`/`Button` components and CSS modules. Don't add new colors, fonts or dependencies, except where this spec says so. The brand name in text is "MissionQual". The logo wordmark stays MISSION/QUAL.

## Ground rules

- Work on `develop`. Commit locally in small, logical commits. **Do not push.** When you're done, give me a summary and wait.
- **The database is already migrated** (`supabase/migrations/20261024120000_community.sql`, applied by Chidi). Don't change the schema or run SQL. If you need a schema change, write a new migration file, explain why, and stop.
- Generated types are in `src/lib/supabase/database.types.ts`. Use them for every query.
- All member writes go through server actions using the **member's own session client** (`src/lib/supabase/server.ts`), so row-level security applies. Never use the admin (service-role) client for member actions. Use it only for:
  1. moderator actions, after `isModerator()` returns true
  2. reading followers and email addresses to send reply notifications
  3. setting `profiles.mailerlite_synced`
- Never take `author_id`, `user_id` or `reporter_id` from the form. Always take them from the session (`getClaims().sub`).
- Members can't write to `posts.pinned`, `posts.status` or `comments.status`; the database rejects it. Only update the columns the migration grants: posts `category, title, body, job_id, accepted_comment_id`; comments `body`. **Never use `.upsert()` on posts or comments.**
- Render member text as plain text. Keep line breaks, but no HTML and no markdown. Plain URLs may be auto-linked with `rel="nofollow noopener"`.
- Rate limits, checked in the server action before inserting: max 10 questions and 50 answers per member per 24 hours. Show a friendly error when the limit is hit.
- `cacheComponents` is on. Anything that reads the session must sit inside `<Suspense>` or call `connection()`, following the existing `AccountLink` pattern.
- Don't run `npm audit fix --force`. Don't touch `.git`. Don't change DNS. Never print `.env.local`.

## Database reference (already applied)

- `profiles`: existing columns, plus `dc_status` (`on_site` | `making_move`), `about`, `came_from`, `email_on_reply` (default true), `mailerlite_synced`. Only signed-in members can read profiles.
- `posts` (questions): `category` is one of `qa_qc`, `welding_piping`, `electrical_ie`, `commissioning`, `pay_offers`, `getting_hired`, `life_on_site`, `introductions`. Also `pinned`, `status` (`visible` | `hidden`), `job_id`, `accepted_comment_id`, `updated_at`. Title is 10 to 160 characters.
- `comments` (answers): `status`, `updated_at`. `parent_id` stays unused in v1: answers are one level only.
- `follows (user_id, post_id)`: a member can only see their own follows.
- `post_votes`, `comment_votes`: the "helpful" toggles.
- `reports`: members can insert, nothing else.
- `moderators (user_id)`: a member can read their own row, so `isModerator()` = "does my row exist".
- `jobs`: plus `category` (`qa_qc`, `commissioning`, `turnover_docs`, `trades`) and `created_at`. Signed-out visitors see only the 3 newest active jobs (RLS policy "public reads the 3 newest jobs"); members see every active job. `public.active_job_count()` (anon RPC) returns the total so the homepage can say "You're seeing 3 of N jobs." On job cards, `context` already reads as the fit line and sometimes ends with the pay (for example "Pays $60–70/hr plus OT."). Show it as is.
- `live_sessions`, `live_session_rsvps`.
- View `post_feed`: posts plus author name, title and `dc_status`, plus `answer_count` and `helpful_count`. Use it for every list of questions.

Topic labels for the UI:

| Category | Label |
|---|---|
| `qa_qc` | QA/QC |
| `welding_piping` | Welding & piping |
| `electrical_ie` | Electrical & I&E |
| `commissioning` | Commissioning |
| `pay_offers` | Pay & offers |
| `getting_hired` | Getting hired |
| `life_on_site` | Life on site |
| `introductions` | Introductions |

## Routing and access

- `/community`: shows the join page when signed out and the member home when signed in. Also `/community/rules`. Both are public.
- Members only: `/community/questions/*`, `/community/ask`, `/community/jobs`, `/community/sessions`, `/community/members*`, `/community/moderation`.
  - Add these to `PROTECTED_PREFIXES` in `src/lib/supabase/proxy.ts`.
  - Redirect signed-out visitors to `/login?next=<original path>`.
- Login, magic link and `/auth/confirm` must honor a safe relative `next`. Today they always go to `/account`.
- The join page "Join the community" buttons go to `/signup?next=/account?welcome=1`. "Sign in" goes to `/login?next=/community`.

## Accounts and profile

- **Restyle `/signup` and `/login`** to the site's look: navy header, paper background, a centered white card with the same input and button styles as the guide pop-up.
  - Signup fields: Full name (saved as `display_name`), Email, Password (min 8).
  - Under the button: "By joining you agree to the community rules." with a link to `/community/rules`.
- **After signup**, go to `/account?welcome=1`.
  - Add a header there: "You're in. Finish your profile so the right people see your questions."
  - Then a button "Go to the community →" pointing to `/community`.
- **Restyle `/account`** as "Your profile". Fields, in order:
  - Full name
  - Current or last role (`job_title`)
  - Where you are now (`dc_status`), two radio cards: "On a data center site" / "Making the move"
  - Years of experience
  - Certifications (comma-separated, shown as chips)
  - Disciplines (multi-select chips: QA/QC, Welding & piping, Electrical & I&E, Commissioning, Turnover & docs, Mechanical, Civil/structural)
  - Location ("City, ST")
  - Came from (for example "Refinery and LNG turnarounds, Gulf Coast")
  - About (500 characters max in the UI)
  - "Email me when someone replies" toggle (`email_on_reply`)
  - Keep the existing save action. It upserts the member's own row, which is allowed.
- **Profile completeness** = share filled of: `job_title`, `dc_status`, `years_experience`, `certifications`, `disciplines`, `location`, `about`. It's used in the member home sidebar card.

## MailerLite: "Community members" list

- Create `src/lib/mailerlite.ts` with `addToGroup(email, groupId, fields?)`. It uses the same API call, 5-second timeout and no-key-logging rules as `app/guide/actions.ts`. Refactor the guide action to use it.
- New env var: `MAILERLITE_COMMUNITY_GROUP_ID=202167143306888344`. Add it to `.env.example` (name only).
- **When to sync:** the first time a member has a confirmed session.
  - In the signup action, if a session comes back.
  - In `/auth/confirm`, after a successful exchange.
  - Only if `profiles.mailerlite_synced` is false.
- **What to send:** `{ email, groups: [community group], fields: { name: display_name } }`. On success, set `mailerlite_synced = true` with the admin client.
- A failure never blocks signup. Log it without the email address.
- This list starts the "Community welcome" emails and stops the guide follow-ups.

## Header and community navigation

- **Site header:**
  - **Signed in:** replace "Sign in" with an initials avatar (teal circle, navy initials) plus first name, linking to `/account`.
  - **On `/community/*` while signed in:** hide the "Get the guide" button, as the design shows.
- **Community sub-nav** (white bar under the header, see the designs):
  - Tabs: Questions (`/community`), Jobs This Week, Live sessions, Members.
  - "Ask a question" button on the right.
  - The Jobs tab shows "N new" for jobs added in the last 7 days.
  - **Mobile:**
    - Tabs read "Questions · Jobs · Sessions · Members", with no count badge.
    - Hide the Ask button in the bar. The member home shows a full-width Ask button instead.

## Pages

### `/community`, signed out: join page (`join.html`)
- Copy exactly as in the design.
- The hero preview cards are examples, not real posts. Keep the design's look (topic tag, Answered badge, title, excerpt, the accepted-answer card) with these changes, because this page is public and the people in it are invented:
  - Add a small "Example" label (IBM Plex Mono, uppercase, muted) to the top of the block.
  - Replace each name and initials avatar with a role-only line: "API 570 inspector · making the move", "QA/QC manager · making the move", and on the accepted answer "Commissioning agent · was API 510 inspector". Use a plain grey circle for the avatar.
  - Remove the times ("2h ago") and the answer and helpful counts.
  - Hard-code it as a decorative `aria-hidden` block.

### `/community`, signed in: member home (`home.html`)
- **Heading:** "Welcome back, {first name}."
- **Line under it:** "{n} new answers on questions you follow". Count answers on followed posts in the last 7 days, not written by the member. Hide the line when the count is 0.
- **Filters:**
  - Topic chips use `?topic=`, with "All" by default.
  - Sort select uses `?sort=`: Newest (default), Unanswered (`answer_count = 0`), Most helpful.
- **Feed:** pinned posts first (the pinned style shown in the design), then 20 per page with "Load more questions" (`?page=`).
  - Each card shows: topic tag, an "Answered" badge when `accepted_comment_id` is set, a "No answers yet" tag when the count is 0, title, a 2-line excerpt, the author (initials avatar, name, `job_title` · "On a data center site" or "making the move", relative time), answer count and helpful count.
- **Sidebar:**
  - Jobs This Week: the latest 3, with "See all".
  - Next live session: date block, title, time in CT, Save my spot / You're in.
  - Profile completion card: only when under 100%.
- **Empty state, no questions yet:** "No questions here yet. Ask the first one." plus the Ask button.

### `/community/questions/[id]` (`question.html`)
- Breadcrumb "← All questions", topic tag, Answered badge, title, author line, body.
- **Question actions:**
  - "Helpful · n": a `post_votes` toggle. It can't be used on your own question.
  - "Follow" / "Following": a `follows` toggle.
- **Answers:**
  - Heading "n answers".
  - Order: accepted answer first, then most helpful, then oldest.
  - The accepted answer gets the teal border and "Accepted answer" badge.
  - Each answer has "Helpful · n" (`comment_votes`, not on your own answer) and "Reply".
  - "Reply" scrolls to the answer box and pre-fills "@First name ". There's no threading in v1.
- **Question author only:** "Mark as accepted answer" / "Unmark" on each answer. This sets `posts.accepted_comment_id`.
- **Own content:** members can edit their own question or answer inline, and delete it after a confirm step.
- **Report:** a "Report" link on the question and on every answer opens a small dialog with a reason textarea, which inserts into `reports`. Then show "Thanks. A moderator will take a look."
- **Answer box:** "Your answer", with the checkbox "Email me when someone replies" ticked by default. On submit:
  - insert the comment
  - auto-follow the question if the box is ticked
  - send notifications (see below)
  - refresh the page
- **Sidebar:** "Asked by" card (avatar, name, role, location · years · certs, "View profile"), then "Related questions": the 3 latest from the same topic, excluding this one.
- Hidden or missing questions show a 404.

### `/community/ask` (`ask.html`)
- **Fields:**
  - "Your question" (title, 10 to 160 characters, with the help text from the design)
  - Topic chips (required, single choice; leave "introductions" out of the picker)
  - Details textarea (optional, up to 10,000 characters)
  - "Email me when someone answers", ticked by default (auto-follow)
- **Buttons:** "Post question" and "Cancel".
- **Coming from a job:** `?job=<id>` pre-fills the title "About this job: {title}, {location}", selects "Getting hired" and sets `job_id`. Show the job as a small card above the form.
- **On success,** go to the new question.

### `/community/jobs` (`jobs.html`)
- **Kicker:** "Week of {Monday of the current week, e.g. October 19}". Title "Jobs This Week" and the intro line from the design.
- **Filters:** category chips (All roles, QA/QC & inspection, Commissioning, Turnover & docs, Trades) and a state select built from `jobs.state`.
- **Cards:** a 3-column grid (1 column on mobile). Each card shows: state, "POSTED {posted_at}", title, company · location, "Why it may fit: {context}", "View posting ↗" (opens in a new tab, `rel="noopener"`) and "Ask about this job" (`/community/ask?job=id`).
- Newest `created_at` first.
- Bottom card: "Saw an opening we should share?" plus "Share a job" (`/community/ask`).
- **Empty state:** "No jobs posted yet this week. New openings go up every Thursday."

### `/community/sessions` (`sessions.html`)
- **Upcoming** (`starts_at >= now()`), soonest first. Each card shows:
  - date block, title
  - "{weekday} · {time} CT · {duration} min · Online"
  - description, host, "n going"
  - "Save my spot", which toggles to "✓ You're in" plus "Add to calendar"
- **Add to calendar:** a route handler `/community/sessions/[id]/ics` returning a standard `.ics` file.
- **Join link:** members who RSVP'd see "Join link" (`join_url`) from 1 hour before start.
- **Sidebar:**
  - "Recordings": past sessions that have `recording_url`, showing title and date · duration, opening in a new tab.
  - "Want to run one?" card linking to `mailto:chidi@missionqual.com?subject=I'd like to run a session`.
- **Empty state:** "No sessions scheduled yet. Check back soon."

### `/community/members` (`members.html`)
- **Heading:** "Members", with "{total} people from oil and gas. {on_site count} are already on data center sites." Show that line only when there are 50 or more members. Under 50, show "People from oil and gas, on data center sites and making the move." instead.
- **Search:** name, `job_title` or certifications (case-insensitive).
- **Filters:**
  - Discipline select (from `disciplines`).
  - State select (the 2 letters after the last comma in `location`).
  - Status chips: Everyone / On a data center site / Making the move.
- **Cards:** a 4-column grid (1 on mobile), 24 per page with "Show more members". Each card shows: avatar, name, location · years, role line, status tag, cert tags.

### `/community/members/[id]` (`profile.html`)
- **Header card:** large avatar, name, role, tags (status, location, years, "Member since {Mon YYYY}"), and counts: Questions, Answers, Helpful votes received (votes on their posts plus votes on their answers).
- **Body:** About, then "Recent activity" (latest 5 questions and answers mixed, with "ANSWERED" / "ASKED" labels, linking to the question).
- **Sidebar:** Certifications, Disciplines, Came from.
- **On your own profile:** "Edit profile" (to `/account`) instead of "Follow answers". For v1, leave "Follow answers" out on other profiles.

### `/community/rules` (public)
- Title "Community rules".
- The four house rules from the join page, each with one sentence of explanation.
- A short "How reporting works" paragraph: any member can report a post, a moderator reviews it, and hidden posts disappear for everyone except the author.
- Add "Community rules" to the footer's LEGAL column.

### `/community/moderation` (moderators only, otherwise 404)
- **List:** open reports, newest first, showing reason, reporter, a link to the content, and created time.
- **Actions** (server actions, admin client, `isModerator()` checked inside every action):
  - Hide / Unhide the post or answer
  - Resolve (sets `resolved_at` and `resolved_by`)
- **Also on question pages, for moderators:** "Pin / Unpin" and "Hide" on the question, and "Hide" on each answer.
- **Header:** moderators see a "Moderation (n)" link next to their avatar when reports are open.

## Reply notifications (email)

- Create `src/lib/notify.ts`. It sends through the Resend REST API (`https://api.resend.com/emails`) with `RESEND_API_KEY`.
  - If the key isn't set, log "notifications skipped" once and do nothing. This must never break posting.
- **From:** `NOTIFY_FROM` (for example `MissionQual Community <community@missionqual.com>`). **Reply-to:** none.
- **When an answer is posted,** notify:
  - the question's author
  - every follower of the question
  - but not the person who answered, and only members with `email_on_reply = true`
- Look up addresses with the admin client (`auth.admin.getUserById`). Send without slowing down the response: fire after the insert, 5-second timeout, errors logged without addresses.
- **Subject:** "{First name} answered: {question title}" (cut to 80 characters).
- **Body:** a simple branded HTML email and a plain-text version: the logo image `https://missionqual.com/email/wordmark-white.png` on a navy bar, a 200-character excerpt, a teal "See the answer" button to the question, and the footer line "You're getting this because you follow this question. Turn off reply emails in your profile." with a link to `/account`.
- Add `RESEND_API_KEY` and `NOTIFY_FROM` to `.env.example`.

## Before you finish

- `npm run lint` and `npm run build` pass.
- Test on localhost at 390px and 1440px with **two** test accounts (A and B). Test addresses only, never real people.
  1. Signed out, `/community` shows the join page. `/community/jobs` redirects to login, then comes back after login.
  2. Sign up as A: redirected to the profile with the welcome header. Profile saves. The header shows A's initials. The MailerLite sync logs success, or a clear skip if the env var is missing.
  3. A asks a question with "email me" ticked. It appears in the feed and A is following it.
  4. B answers. A gets a notification if Resend is configured. B can't mark B's own answer as accepted. A can.
  5. Helpful toggles work and counts update. You can't vote on your own content.
  6. B reports A's question. B can't see the moderation page.
  7. RSVP and cancel work. The `.ics` file downloads.
  8. Members search and filters work, and the profile pages show the right counts.
  9. As a signed-in member, try to set `pinned = true` on your own post through the Supabase client. It must fail. Tell me the error you got.
  10. No console errors.
- **Report back:** the files changed, the env vars I need to add (locally and in Vercel), anything you couldn't match from the design, and anything in this spec you disagree with.
