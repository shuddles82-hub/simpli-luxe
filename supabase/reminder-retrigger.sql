-- Tracks when a member's Soft Life Reminders sequence was last (re)started,
-- so the weekly re-trigger cron knows who's finished their 4-week/16-email
-- run and is due to be looped back through it. Run once in Supabase:
-- SQL Editor > paste > Run.

alter table public.profiles
  add column if not exists reminder_last_sent_at timestamptz;
