import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getMemberFromRequest } from '@/lib/auth-server';
import { setKitTag } from '@/lib/kit';

// Toggles a member's email notification preference: new-content alerts
// or Soft Life Reminders. The Kit tag is what actually drives her Kit
// Automations/Sequences; the profiles column is just so the app can
// show the current on/off state without an extra Kit API call per
// render.

export const runtime = 'nodejs';

const PREFS = {
  content: { column: 'notify_new_content', tag: 'Notify: New Content' },
  reminder: { column: 'notify_daily_reminder', tag: 'Soft Life Reminders - Opt In' },
};

export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ ok: false, error: 'Not configured' });

  const member = await getMemberFromRequest(request);
  if (!member) return Response.json({ ok: false, error: 'Please sign in first.' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false });
  }

  const pref = PREFS[body?.type];
  const enabled = Boolean(body?.enabled);
  if (!pref) return Response.json({ ok: false, error: 'Unknown preference' });

  await admin.from('profiles').update({ [pref.column]: enabled }).eq('id', member.id);
  await setKitTag({ email: member.email, tagName: pref.tag, enabled });

  return Response.json({ ok: true });
}
