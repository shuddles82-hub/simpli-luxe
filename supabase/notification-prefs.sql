-- Email notification preferences (new content alerts, daily reminder).
-- Run this once in Supabase: SQL Editor > paste > Run.
-- These are plain member-writable columns, same as display_name --
-- no RLS changes needed, the existing "Members update own profile"
-- policy already covers them.

alter table public.profiles
  add column if not exists notify_new_content boolean not null default false,
  add column if not exists notify_daily_reminder boolean not null default false;
