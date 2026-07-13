import { getSipById } from '@/lib/content';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getMemberFromRequest } from '@/lib/auth-server';

// Free sips render fully server-side (SEO stays intact). Premium sips
// are redacted to a teaser here and only sent whole to a verified
// Luxe Insider, mirroring the Library's tier check.

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { id } = await params;
  const sip = await getSipById(id);
  if (!sip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (!sip.premium) return Response.json({ sip, locked: false });

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
  if (isInsider) return Response.json({ sip, locked: false });

  const { ingredients, howToMake, ritualMoment, vibeNotes, flavorProfile, ...teaser } = sip;
  return Response.json({ sip: teaser, locked: true });
}
