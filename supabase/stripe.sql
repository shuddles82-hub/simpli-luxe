-- Stripe / Luxe Insider (Phase 5, payments).
-- Run this once in Supabase: open your project, click "SQL Editor"
-- in the left sidebar, paste this whole file, press "Run".
-- Safe to run more than once.

-- Link each member to their Stripe customer record.
alter table public.profiles
  add column if not exists stripe_customer_id text;

-- Membership fields (is_insider, insider_since, stripe_customer_id) must
-- only ever be set by the server (Stripe checkout and webhook, which use
-- the service role). This stops a member from granting herself Luxe
-- Insider by editing her own profile row directly.
create or replace function public.protect_insider_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Service-role / trusted server writes have no end-user identity.
  if auth.uid() is null then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if coalesce(new.is_insider, false) is true
       or new.insider_since is not null
       or new.stripe_customer_id is not null then
      raise exception 'Membership fields are managed by the system.';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.is_insider is distinct from old.is_insider
       or new.insider_since is distinct from old.insider_since
       or new.stripe_customer_id is distinct from old.stripe_customer_id then
      raise exception 'Membership fields are managed by the system.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_insider on public.profiles;
create trigger protect_insider
  before insert or update on public.profiles
  for each row execute function public.protect_insider_fields();
