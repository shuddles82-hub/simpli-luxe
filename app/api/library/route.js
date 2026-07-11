import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getMemberFromRequest } from '@/lib/auth-server';

// Lists Library items for a signed-in member. Every item's title and
// description are visible so members can see what's available; the
// storage path never leaves the server. `canDownload` tells the UI
// whether this member's tier allows the actual file.

export const runtime = 'nodejs';

export async function GET(request) {
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ items: [] });

  const member = await getMemberFromRequest(request);
  if (!member) return Response.json({ items: [], signedOut: true });

  const { data: profile } = await admin
    .from('profiles')
    .select('is_insider')
    .eq('id', member.id)
    .maybeSingle();
  const isInsider = Boolean(profile?.is_insider);

  const { data: rows } = await admin
    .from('library_items')
    .select('id, title, description, category, tier, file_type, sort_order')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const items = (rows || []).map((row) => ({
    ...row,
    canDownload: row.tier === 'free' || isInsider,
  }));

  return Response.json({ items, isInsider });
}
