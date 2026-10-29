-- MissionQual community, version 1.
-- Extends the existing profiles / posts / comments / follows / jobs tables
-- and adds helpful votes, reports, moderators, live sessions and RSVPs.
-- Community content is for signed-in members only.
-- Moderator actions (pin, hide, resolve reports, add sessions) run on the
-- server with the service role, after the server checks public.moderators.

-- =========================================================================
-- 0. Security fix flagged by Supabase: handle_new_user is a trigger only.
-- =========================================================================
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- =========================================================================
-- 1. Profiles
-- =========================================================================
alter table public.profiles
  add column if not exists dc_status text
    check (dc_status in ('on_site', 'making_move')),
  add column if not exists about text
    check (about is null or char_length(about) <= 2000),
  add column if not exists came_from text
    check (came_from is null or char_length(came_from) <= 200),
  add column if not exists email_on_reply boolean not null default true,
  add column if not exists mailerlite_synced boolean not null default false;

drop policy if exists "profiles readable" on public.profiles;
drop policy if exists "own profile" on public.profiles;
drop policy if exists "insert own profile" on public.profiles;

create policy "members read profiles" on public.profiles
  for select to authenticated using (true);
create policy "members insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "members update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- =========================================================================
-- 2. Moderators (managed by MissionQual admins, never by members)
-- =========================================================================
create table if not exists public.moderators (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.moderators enable row level security;
create policy "members see if they are a moderator" on public.moderators
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.moderators from anon, authenticated;

-- =========================================================================
-- 3. Jobs: members see new jobs first, the public a week later
-- =========================================================================
alter table public.jobs
  add column if not exists category text
    check (category in ('qa_qc', 'commissioning', 'turnover_docs', 'trades')),
  add column if not exists created_at timestamptz not null default now();

drop policy if exists "jobs readable" on public.jobs;
create policy "public reads jobs after a week" on public.jobs
  for select to anon using (active and created_at <= now() - interval '7 days');
create policy "members read active jobs" on public.jobs
  for select to authenticated using (active);

-- =========================================================================
-- 4. Posts (questions)
-- =========================================================================
update public.posts set pinned = false where pinned is null;
alter table public.posts
  alter column pinned set not null,
  add column if not exists status text not null default 'visible'
    check (status in ('visible', 'hidden')),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists job_id uuid references public.jobs(id) on delete set null;

alter table public.posts
  add constraint posts_category_check check (category in (
    'qa_qc', 'welding_piping', 'electrical_ie', 'commissioning',
    'pay_offers', 'getting_hired', 'life_on_site', 'introductions')),
  add constraint posts_title_length check (char_length(title) between 10 and 160),
  add constraint posts_body_length check (body is null or char_length(body) <= 10000);

drop policy if exists "posts readable" on public.posts;
drop policy if exists "members post" on public.posts;
drop policy if exists "own post" on public.posts;

create policy "members read posts" on public.posts
  for select to authenticated using (status = 'visible' or author_id = auth.uid());
create policy "members create posts" on public.posts
  for insert to authenticated with check (author_id = auth.uid());
create policy "authors edit posts" on public.posts
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "authors delete posts" on public.posts
  for delete to authenticated using (author_id = auth.uid());

-- Members can only write these columns. pinned and status are moderator-only.
revoke insert, update on public.posts from anon, authenticated;
grant insert (author_id, category, title, body, job_id) on public.posts to authenticated;

-- =========================================================================
-- 5. Comments (answers)
-- =========================================================================
alter table public.comments
  alter column post_id set not null,
  add column if not exists status text not null default 'visible'
    check (status in ('visible', 'hidden')),
  add column if not exists updated_at timestamptz not null default now();
alter table public.comments
  add constraint comments_body_length check (char_length(body) between 1 and 10000);

-- Accepted answer lives on the post; added after comments exist.
alter table public.posts
  add column if not exists accepted_comment_id uuid references public.comments(id) on delete set null;
grant update (category, title, body, job_id, accepted_comment_id) on public.posts to authenticated;

drop policy if exists "comments readable" on public.comments;
drop policy if exists "members comment" on public.comments;
drop policy if exists "own comment" on public.comments;

create policy "members read comments" on public.comments
  for select to authenticated using (status = 'visible' or author_id = auth.uid());
create policy "members answer visible posts" on public.comments
  for insert to authenticated with check (
    author_id = auth.uid()
    and exists (select 1 from public.posts p where p.id = post_id and p.status = 'visible'));
create policy "authors edit comments" on public.comments
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "authors delete comments" on public.comments
  for delete to authenticated using (author_id = auth.uid());

revoke insert, update on public.comments from anon, authenticated;
grant insert (post_id, author_id, parent_id, body) on public.comments to authenticated;
grant update (body) on public.comments to authenticated;

-- Keep updated_at current and the accepted answer valid.
create or replace function public.posts_before_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.accepted_comment_id is not null and not exists (
    select 1 from public.comments c
    where c.id = new.accepted_comment_id and c.post_id = new.id) then
    raise exception 'The accepted answer must be an answer to this question';
  end if;
  if new.title is distinct from old.title or new.body is distinct from old.body then
    new.updated_at := now();
  end if;
  return new;
end $$;
create trigger posts_before_update before update on public.posts
  for each row execute function public.posts_before_update();

create or replace function public.comments_before_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.body is distinct from old.body then new.updated_at := now(); end if;
  return new;
end $$;
create trigger comments_before_update before update on public.comments
  for each row execute function public.comments_before_update();

-- =========================================================================
-- 6. Follows: members only see and manage their own
-- =========================================================================
drop policy if exists "follows readable" on public.follows;
drop policy if exists "own follows" on public.follows;
create policy "members read own follows" on public.follows
  for select to authenticated using (user_id = auth.uid());
create policy "members follow" on public.follows
  for insert to authenticated with check (user_id = auth.uid());
create policy "members unfollow" on public.follows
  for delete to authenticated using (user_id = auth.uid());

-- =========================================================================
-- 7. Helpful votes
-- =========================================================================
create table if not exists public.post_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create table if not exists public.comment_votes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
alter table public.post_votes enable row level security;
alter table public.comment_votes enable row level security;
create policy "members read post votes" on public.post_votes for select to authenticated using (true);
create policy "members vote on posts" on public.post_votes for insert to authenticated with check (user_id = auth.uid());
create policy "members unvote posts" on public.post_votes for delete to authenticated using (user_id = auth.uid());
create policy "members read answer votes" on public.comment_votes for select to authenticated using (true);
create policy "members vote on answers" on public.comment_votes for insert to authenticated with check (user_id = auth.uid());
create policy "members unvote answers" on public.comment_votes for delete to authenticated using (user_id = auth.uid());

-- =========================================================================
-- 8. Reports (members flag; moderators review on the server)
-- =========================================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 1000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  check (num_nonnulls(post_id, comment_id) = 1)
);
alter table public.reports enable row level security;
create policy "members report" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());
revoke insert, update, delete on public.reports from anon, authenticated;
grant insert (post_id, comment_id, reason, reporter_id) on public.reports to authenticated;

-- =========================================================================
-- 9. Live sessions and RSVPs
-- =========================================================================
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 5 and 160),
  description text,
  host_name text not null,
  host_profile_id uuid references public.profiles(id) on delete set null,
  starts_at timestamptz not null,
  duration_minutes int not null default 60 check (duration_minutes between 10 and 240),
  join_url text,
  recording_url text,
  created_at timestamptz not null default now()
);
create table if not exists public.live_session_rsvps (
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);
alter table public.live_sessions enable row level security;
alter table public.live_session_rsvps enable row level security;
create policy "members read sessions" on public.live_sessions for select to authenticated using (true);
revoke insert, update, delete on public.live_sessions from anon, authenticated;
create policy "members read rsvps" on public.live_session_rsvps for select to authenticated using (true);
create policy "members rsvp" on public.live_session_rsvps for insert to authenticated with check (user_id = auth.uid());
create policy "members cancel rsvp" on public.live_session_rsvps for delete to authenticated using (user_id = auth.uid());

-- =========================================================================
-- 10. Feed view with counts (runs with the reader's permissions)
-- =========================================================================
create or replace view public.post_feed with (security_invoker = true) as
select
  p.id, p.title, p.body, p.category, p.pinned, p.status, p.job_id,
  p.accepted_comment_id, p.author_id, p.created_at, p.updated_at,
  pr.display_name as author_name,
  pr.job_title as author_title,
  pr.dc_status as author_dc_status,
  (select count(*) from public.comments c where c.post_id = p.id and c.status = 'visible') as answer_count,
  (select count(*) from public.post_votes v where v.post_id = p.id) as helpful_count
from public.posts p
left join public.profiles pr on pr.id = p.author_id;
revoke all on public.post_feed from anon;
grant select on public.post_feed to authenticated;

-- =========================================================================
-- 11. Indexes
-- =========================================================================
create index if not exists posts_feed_idx on public.posts (pinned desc, created_at desc) where status = 'visible';
create index if not exists posts_category_idx on public.posts (category, created_at desc);
create index if not exists posts_author_idx on public.posts (author_id);
create index if not exists comments_post_idx on public.comments (post_id, created_at);
create index if not exists comments_author_idx on public.comments (author_id);
create index if not exists comment_votes_comment_idx on public.comment_votes (comment_id);
create index if not exists post_votes_post_idx on public.post_votes (post_id);
create index if not exists live_sessions_starts_idx on public.live_sessions (starts_at);
create index if not exists reports_open_idx on public.reports (created_at) where resolved_at is null;
