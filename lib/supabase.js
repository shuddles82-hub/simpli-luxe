'use client';

import { createClient } from '@supabase/supabase-js';

// Browser-side Supabase client. The anon key is safe to expose: every
// table is protected by row-level security, so a signed-out visitor
// can read and write nothing. Returns null when Supabase is not
// configured yet, and member features quietly stay hidden.

let client = null;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!client) client = createClient(url, anonKey);
  return client;
}
