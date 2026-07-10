-- Luxe Insider membership flag (Phase 5).
-- Run this once in Supabase: open your project, click "SQL Editor"
-- in the left sidebar, paste this whole file, press "Run".
--
-- Until Stripe checkout is wired up, you can gift Insider status by
-- hand: in Supabase, open Table Editor > profiles, find the member,
-- and tick is_insider. Stripe will automate this later.

alter table public.profiles
  add column if not exists is_insider boolean not null default false;

alter table public.profiles
  add column if not exists insider_since timestamptz;
