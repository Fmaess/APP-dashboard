-- Run once in Supabase → SQL Editor → New query → Run.
-- Every table carries user_id and is locked to the signed-in owner by RLS.

-- Real Estate: Ist-Werte je Monat (one row per month, id = 'YYYY-MM')
create table if not exists public.re_ist (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id         text not null check (id ~ '^\d{4}-\d{2}$'),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Briefing: one row per briefing; the dashboard shows the newest
create table if not exists public.briefings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  for_date   date not null default current_date,
  title      text not null,
  body_md    text not null,
  created_at timestamptz not null default now()
);
create index if not exists briefings_user_date on public.briefings (user_id, for_date desc, created_at desc);

alter table public.re_ist    enable row level security;
alter table public.briefings enable row level security;

drop policy if exists "owner only" on public.re_ist;
create policy "owner only" on public.re_ist
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "owner only" on public.briefings;
create policy "owner only" on public.briefings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
