-- SimpliBot daily allowance (10 a day for members, 100 for Luxe Insiders).
-- Run this once in Supabase: SQL Editor > paste this whole file > Run.
-- Safe to run more than once.
--
-- Each SimpliBot reply is counted here. Row-level security is on with NO
-- policies for members, on purpose: only the website's server can read or
-- add rows, so a member cannot delete her own count to get more moments.
-- (The count used to live in planner_entries, which members can edit.)

create table if not exists public.simplibot_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists simplibot_usage_user_time
  on public.simplibot_usage (user_id, created_at);

alter table public.simplibot_usage enable row level security;
-- No policies added: members reach this only through /api/simplibot.
