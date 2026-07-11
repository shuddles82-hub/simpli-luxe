-- Luxe Library (Phase 5, final piece).
-- Run this once in Supabase: open your project, click "SQL Editor"
-- in the left sidebar, paste this whole file, press "Run".
--
-- This table lists what's in the Library (title, description, which
-- file, whether it's free or Luxe Insider only). It has row-level
-- security with NO policies for members, on purpose: the app's server
-- routes read it with a trusted key and decide what each member is
-- allowed to see and download. A member can never query this table or
-- the storage bucket directly.

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  tier text not null default 'free' check (tier in ('free', 'insider')),
  storage_path text not null,
  file_type text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.library_items enable row level security;
-- No policies added: only the server (service role) can read this
-- table. Members reach it exclusively through /api/library.

-- Private storage bucket for the actual files. No public access, no
-- policies for signed-in members either — the server issues short-lived
-- signed download links after checking the member's tier.
insert into storage.buckets (id, name, public, file_size_limit)
values ('library', 'library', false, 52428800) -- 50 MB per file
on conflict (id) do update set file_size_limit = excluded.file_size_limit;
