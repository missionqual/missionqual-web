create table public.guide_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  source text,
  referrer text,
  user_agent text,
  mailerlite_synced boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.guide_leads enable row level security;
-- No policies on purpose: only the server (service role) can read or write.
