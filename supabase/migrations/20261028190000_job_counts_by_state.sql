-- Applied to production on 2026-10-28.
-- Open-job counts per state, readable by visitors, so a page can say
-- "4 open jobs near this site. Join to see them." without exposing the jobs.
create or replace function public.active_job_counts_by_state()
returns table(state text, jobs integer)
language sql stable security definer set search_path = ''
as $$ select j.state, count(*)::int from public.jobs j where j.active and j.state is not null group by j.state order by j.state $$;
revoke all on function public.active_job_counts_by_state() from public;
grant execute on function public.active_job_counts_by_state() to anon, authenticated;
