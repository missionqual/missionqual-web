-- Applied to production on 2026-10-25.
-- Visitors (not signed in) see only the 3 newest active jobs. Members see every active job.
-- Replaces the old "public reads jobs after a week" rule.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.public_job_ids()
returns setof uuid language sql stable security definer set search_path = ''
as $$ select id from public.jobs where active order by posted_at desc nulls last, created_at desc limit 3 $$;
revoke all on function private.public_job_ids() from public;
grant execute on function private.public_job_ids() to anon;

-- Total active jobs, so the homepage can say "You're seeing 3 of N jobs."
create or replace function public.active_job_count()
returns integer language sql stable security definer set search_path = ''
as $$ select count(*)::int from public.jobs where active $$;
revoke all on function public.active_job_count() from public;
grant execute on function public.active_job_count() to anon;

drop policy if exists "public reads jobs after a week" on public.jobs;
drop policy if exists "public reads the 3 newest jobs" on public.jobs;
create policy "public reads the 3 newest jobs" on public.jobs
  for select to anon
  using (id in (select private.public_job_ids()));
