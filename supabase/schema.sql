-- Simpli Luxe member tables (Phase 3 + foundation for Phase 4).
-- Run this once in Supabase: open your project, click "SQL Editor"
-- in the left sidebar, paste this whole file, press "Run".
-- Every table uses row-level security: members can only ever see
-- and change their own rows.

-- Profiles: one row per member, created automatically on sign-up.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Members read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Members create own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Members update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Create a profile row the moment someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Saves: favorited content (shifts, lessons, sips).
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_key text not null,
  series text,
  title text,
  href text,
  created_at timestamptz not null default now(),
  unique (user_id, content_key)
);

alter table public.saves enable row level security;

create policy "Members read own saves"
  on public.saves for select using (auth.uid() = user_id);
create policy "Members create own saves"
  on public.saves for insert with check (auth.uid() = user_id);
create policy "Members delete own saves"
  on public.saves for delete using (auth.uid() = user_id);

-- Planner entries (used by the Luxe Planner in Phase 4).
create table if not exists public.planner_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  entry_date date,
  done boolean not null default false,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.planner_entries enable row level security;

create policy "Members read own planner"
  on public.planner_entries for select using (auth.uid() = user_id);
create policy "Members create own planner"
  on public.planner_entries for insert with check (auth.uid() = user_id);
create policy "Members update own planner"
  on public.planner_entries for update using (auth.uid() = user_id);
create policy "Members delete own planner"
  on public.planner_entries for delete using (auth.uid() = user_id);

-- Journal entries (used by the Luxe Planner in Phase 4).
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  body text,
  mood text,
  created_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create policy "Members read own journal"
  on public.journal_entries for select using (auth.uid() = user_id);
create policy "Members create own journal"
  on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "Members update own journal"
  on public.journal_entries for update using (auth.uid() = user_id);
create policy "Members delete own journal"
  on public.journal_entries for delete using (auth.uid() = user_id);
