-- Applied to production on 2026-10-28.
-- 1) Structured pay on jobs (pay used to live only inside the "why it may fit" text).
alter table public.jobs
  add column if not exists pay_min numeric,
  add column if not exists pay_max numeric,
  add column if not exists pay_unit text check (pay_unit in ('hour','year')),
  add column if not exists per_diem_day numeric;

-- 2) Visitors get overall pay ranges by role category, computed from every active
--    job, without seeing the job rows (they only see the 3 newest jobs).
create or replace function public.job_pay_summary()
returns table(category text, pay_unit text, postings integer, low numeric, high numeric)
language sql stable security definer set search_path = ''
as $$
  select j.category, j.pay_unit, count(*)::int, min(j.pay_min), max(coalesce(j.pay_max, j.pay_min))
  from public.jobs j
  where j.active and j.pay_min is not null and j.category is not null
  group by j.category, j.pay_unit
  order by j.category, j.pay_unit
$$;
revoke all on function public.job_pay_summary() from public;
grant execute on function public.job_pay_summary() to anon, authenticated;

-- 3) Data center projects by state (public news, readable by everyone; written by admins only).
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner text,
  city text,
  state text not null,
  size text,
  status text not null default 'Under construction',
  timeline text,
  source_name text,
  source_url text,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon, authenticated;
drop policy if exists "anyone reads active projects" on public.projects;
create policy "anyone reads active projects" on public.projects
  for select to anon, authenticated using (active);
create index if not exists projects_state_idx on public.projects(state) where active;
