import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client using the service-role key. This bypasses
// row-level security, so it is used ONLY in trusted server routes (the
// Stripe checkout and webhook) to set membership fields a member cannot
// set herself. Never import this into a client component.
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
