import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { setKitTag } from '@/lib/kit';

// Runs weekly via Vercel Cron (see vercel.json). Staci's Soft Life
// Reminders sequence is a finite 16 emails over 4 weeks, so a member
// who opted in over 5 weeks ago (a buffer past the sequence's own
// length) has necessarily finished it. This loops her back through it:
// removing then re-applying the trigger tag is a genuine fresh "add"
// event, which is what re-fires Kit's "Tag Added" trigger.

export const runtime = 'nodejs';

const REMINDER_TAG = 'Soft Life Reminders - Opt In';
const RETRIGGER_AFTER_DAYS = 35;

export async function GET(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ ok: false, error: 'Not configured' });

  const cutoff = new Date(Date.now() - RETRIGGER_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: due } = await admin
    .from('profiles')
    .select('id')
    .eq('notify_daily_reminder', true)
    .or(`reminder_last_sent_at.is.null,reminder_last_sent_at.lt.${cutoff}`);

  let retriggered = 0;
  for (const profile of due || []) {
    const { data: userData } = await admin.auth.admin.getUserById(profile.id);
    const email = userData?.user?.email;
    if (!email) continue;

    await setKitTag({ email, tagName: REMINDER_TAG, enabled: false });
    const ok = await setKitTag({ email, tagName: REMINDER_TAG, enabled: true });
    if (ok) {
      await admin
        .from('profiles')
        .update({ reminder_last_sent_at: new Date().toISOString() })
        .eq('id', profile.id);
      retriggered += 1;
    }
  }

  return Response.json({ ok: true, retriggered });
}
