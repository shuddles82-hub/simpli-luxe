import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getMemberFromRequest } from '@/lib/auth-server';
import { addMemberToKit, setKitTag } from '@/lib/kit';

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

  const update = { [pref.column]: enabled };
  // Starts (or restarts) the 5-week re-trigger clock from the moment she
  // actually opts in, so the weekly cron doesn't loop her back through
  // the sequence again right away.
  if (body.type === 'reminder' && enabled) update.reminder_last_sent_at = new Date().toISOString();

  // Kit first: the saved on/off state should only change once the tag
  // that actually drives the emails has changed.
  let tagged = await setKitTag({ email: member.email, tagName: pref.tag, enabled });
  if (!tagged && enabled) {
    // She is asking for emails but is not on the Kit list yet (for
    // example, she joined before the Kit sync existed). Add her, then
    // try the tag once more.
    await addMemberToKit({ email: member.email });
    tagged = await setKitTag({ email: member.email, tagName: pref.tag, enabled });
  }
  if (!tagged) return Response.json({ ok: false, error: 'Kit did not accept the change' });

  const { error } = await admin.from('profiles').update(update).eq('id', member.id);
  if (error) return Response.json({ ok: false, error: 'Could not save the preference' });

  return Response.json({ ok: true });
}
