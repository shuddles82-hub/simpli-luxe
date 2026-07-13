import { getLessonById } from '@/lib/content';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getMemberFromRequest } from '@/lib/auth-server';

// Free lessons render fully server-side (SEO stays intact). Premium
// lessons are redacted to a teaser here and only sent whole to a
// verified Luxe Insider, mirroring the Library's tier check.

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { id } = await params;
  const item = await getLessonById(id);
  if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
  if (!item.premium) return Response.json({ item, locked: false });

  const admin = getSupabaseAdmin();
  const member = admin ? await getMemberFromRequest(request) : null;
  let isInsider = false;
  if (admin && member) {
    const { data: profile } = await admin
      .from('profiles')
      .select('is_insider')
      .eq('id', member.id)
      .maybeSingle();
    isInsider = Boolean(profile?.is_insider);
  }
  if (isInsider) return Response.json({ item, locked: false });

  const { body, quote, ...teaser } = item;
  return Response.json({ item: teaser, locked: true });
}
