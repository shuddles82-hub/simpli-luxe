import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client using the service-role key. This bypasses
// row-level security, so it is used ONLY in trusted server routes
// (Stripe, the Library, Insider content checks, Kit preferences, and the
// reminder cron) to read or set things a member cannot touch herself.
// Never import this into a client component.
let admin = null;

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!admin) {
    admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
